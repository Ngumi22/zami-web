"use server";

import prisma from "./prisma";
import { getIp, isIpBlockedForAuth } from "./security";

class RateLimitError extends Error {
  constructor(message = "Too many requests. Please slow down.") {
    super(message);
    this.name = "RateLimitError";
  }
}

interface RateLimitOptions {
  windowSec: number;
  max: number;
  identifier?: string;
}

export async function requireRateLimit({
  windowSec,
  max,
  identifier,
}: RateLimitOptions) {
  await isIpBlockedForAuth();

  const key = identifier ?? (await getIp());
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.rateLimit.findUnique({ where: { key } });

    if (!record) {
      await tx.rateLimit.create({
        data: { key, count: 1, lastRequest: now },
      });
      return { limited: false };
    }

    if (record.lastRequest < windowStart) {
      await tx.rateLimit.update({
        where: { key },
        data: { count: 1, lastRequest: now },
      });
      return { limited: false };
    }

    if (record.count >= max) {
      return { limited: true };
    }

    await tx.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 }, lastRequest: now },
    });
    return { limited: false };
  });

  if (result.limited) {
    throw new RateLimitError();
  }
}
