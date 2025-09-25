"use server";
import { headers } from "next/headers";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

interface BlockIpOptions {
  ip: string;
  reason?: string;
  durationSeconds?: number;
}

export async function isBotUserAgent(): Promise<boolean> {
  try {
    const hdrs = await headers();
    const userAgent = hdrs.get("user-agent")?.toLowerCase() ?? "";

    if (!userAgent || /bot|crawl|slurp|spider/i.test(userAgent)) {
      return true;
    }

    // Expanded bot indicators
    const botPatterns = [
      /bot/i,
      /crawl/i,
      /slurp/i,
      /spider/i,
      /http/i, // suspicious libs
      /fetch/i,
      /axios/i,
      /curl/i,
      /python/i,
      /node/i,
    ];

    return botPatterns.some((pattern) => pattern.test(userAgent));
  } catch {
    return false;
  }
}

interface BlockIpOptions {
  ip: string;
  reason?: string;
  durationSeconds?: number;
}

export async function blockIp({ ip, reason, durationSeconds }: BlockIpOptions) {
  if (!ip) {
    return { success: false, message: "IP address is required." };
  }

  const expiresAt =
    durationSeconds && durationSeconds > 0
      ? new Date(Date.now() + durationSeconds * 1000)
      : null;

  try {
    await prisma.blockedIp.upsert({
      where: { ip },
      update: {
        reason: reason ?? "Blocked by system",
        expiresAt,
      },
      create: {
        ip,
        reason: reason ?? "Blocked by system",
        expiresAt,
      },
    });

    return { success: true, message: `IP ${ip} has been blocked.` };
  } catch (error) {
    console.error("Failed to block IP:", error);
    return { success: false, message: "Database operation failed." };
  }
}

export async function getIp(): Promise<string> {
  try {
    const hdrs = await headers();

    const forwarded = hdrs.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    const realIp = hdrs.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export async function isIpBlockedForAuth(): Promise<boolean> {
  try {
    const ip = await getIp();

    const blocked = await prisma.blockedIp.findUnique({ where: { ip } });
    if (!blocked) return false;

    if (blocked.expiresAt && blocked.expiresAt < new Date()) {
      await prisma.blockedIp.delete({ where: { ip } });
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function handleFailedAuth(ip: string) {
  const failedAttempts = await prisma.rateLimit.findUnique({
    where: { key: ip },
  });

  if (failedAttempts && failedAttempts.count >= 10) {
    await blockIp({
      ip,
      reason: "Repeated failed login attempts.",
      durationSeconds: 7 * 24 * 60 * 60,
    });
  }
}

export async function guardAuthFlow() {
  const ip = await getIp();

  if (await isIpBlockedForAuth()) {
    return { ok: false, message: "Access from your network is restricted." };
  }

  if (await isBotUserAgent()) {
    await blockIp({ ip, reason: "Bot detected", durationSeconds: 3600 });
    return { ok: false, message: "Automated access blocked." };
  }

  return { ok: true };
}
