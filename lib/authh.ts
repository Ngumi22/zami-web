import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";
import { guardAuthFlow, isIpBlockedForAuth } from "./security";
import { sendMagicLink, sendOTP, sendPasswordResetEmail } from "./auth/email";
import { magicLink, twoFactor } from "better-auth/plugins";
import { Customer, User } from "@prisma/client";
import { toast } from "sonner";

export const auth = betterAuth({
  user: {
    modelName: "user",
    storage: {
      email: "email",
      password: "passwordHash",
      sessions: { modelName: "userSession", userField: "userId" },
      verificationTokens: {
        modelName: "userVerificationToken",
        userField: "userId",
      },
    },
    additionalFields: {
      name: { type: "string" },
      role: { type: "string", defaultValue: "ADMIN" },
      image: { type: "string", required: false },
      twoFactorEnabled: { type: "boolean", required: false },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: true,
      onSignIn: async ({ user }: { user: User }) => {
        const guard = await guardAuthFlow();
        if (!guard.ok) return guard;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return { ok: true };
      },
    },
  },

  customer: {
    modelName: "customer",
    storage: {
      email: "email",
      sessions: { modelName: "customerSession", userField: "customerId" },
      accounts: {
        modelName: "customerAccount",
        userField: "customerId",
        provider: "provider",
        providerId: "providerAccountId",
        password: "passwordHash",
      },
      verificationTokens: {
        modelName: "CustomerVerificationToken",
        userField: "customerId",
      },
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
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: Customer;
        url: string;
      }) => {
        await sendPasswordResetEmail(user.email, url);
      },
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "database",
    modelName: "RateLimit",
  },

  advanced: {
    database: { generateId: false },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  trustedOrigins: ["https://www.zami.co.ke"],
  plugins: [
    nextCookies(),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendOTP(user.email, otp);
        },
      },
      skipVerificationOnEnable: true,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink(email, url);
      },
    }),
  ],
});
