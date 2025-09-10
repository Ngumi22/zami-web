import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { isIpBlockedForAuth } from "./security";
import prisma from "./prisma";

export const auth = betterAuth({
  customer: {
    additionalFields: {
      phone: { type: "string", required: false },
      status: { type: "string", default: "PENDING_VERIFICATION" },
      totalSpent: { type: "number", default: 0 },
      authProvider: { type: "string", default: "EMAIL" },
      providerId: { type: "string", required: false },
      avatar: { type: "string", required: false },
    },
    storage: "database",
    modelName: "customer",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
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
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
  trustedOrigins: ["https://www.zami.co.ke", "http://localhost:3000"],
  plugins: [nextCookies()],
});
