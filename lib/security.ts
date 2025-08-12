"use server";
import { headers } from "next/headers";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

interface BlockIpOptions {
  ip: string;
  reason?: string;
  durationSeconds?: number;
}

export async function blockIp({ ip, reason, durationSeconds }: BlockIpOptions) {
  if (!ip) {
    return { success: false, message: "IP address is required." };
  }

  const expiresAt = durationSeconds
    ? new Date(Date.now() + durationSeconds * 1000)
    : null;

  try {
    await prisma.blockedIp.upsert({
      where: { ip },
      update: { reason, expiresAt },
      create: { ip, reason, expiresAt },
    });
    revalidatePath("/admin");

    return { success: true, message: `IP ${ip} has been blocked.` };
  } catch (error) {
    console.error("Failed to block IP:", error);
    return { success: false, message: "Database operation failed." };
  }
}

export async function getIp() {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0] ?? "unknown-ip";
}

export async function isIpBlockedForAuth() {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0];
    if (!ip) return false;

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
