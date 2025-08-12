import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { isIpBlockedForAuth } from "./security";

const prisma = new PrismaClient();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    onSignIn: async () => {
      const isBlocked = await isIpBlockedForAuth();
      if (isBlocked) {
        return {
          ok: false,
          message: "Access from your network is restricted.",
        };
      }
      return { ok: true };
    },
  },
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "database",
    modelName: "rateLimit",
  },
  advanced: {
    database: {
      generateId: false,
    },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  plugins: [nextCookies()],
});
