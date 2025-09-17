import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { isIpBlockedForAuth } from "./security";
import prisma from "./prisma";
import { sendMagicLink, sendOTP, sendPasswordResetEmail } from "./auth/email";
import {
  anonymous,
  magicLink,
  oneTap,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  customer: {
    modelName: "customer",
    storage: {
      password: "password",
      email: "email",
      social: {
        providerId: "providerId",
        authProvider: "authProvider",
        emailVerified: "emailVerified",
      },
      sessions: {
        modelName: "customerSession",
        userField: "customerId",
      },
      socialAccounts: {
        modelName: "customerSocialAccount",
        userField: "customerId",
      },
    },
    additionalFields: {
      phone: { type: "string", required: false },
      status: { type: "string" },
      totalSpent: { type: "number" },
      avatar: { type: "string", required: false },
    },
  },

  user: {
    modelName: "user",
    storage: {
      email: "email",
      sessions: {
        modelName: "session",
        userField: "userId",
      },
      socialAccounts: {
        modelName: "account",
        userField: "userId",
      },
    },
    additionalFields: {
      role: { type: "string" },
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
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
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
    passkey({ origin: process.env.NEXT_PUBLIC_APP_URL }),
    username(),
    anonymous({
      emailDomainName: "example.com",
    }),
    oneTap(),
  ],
});
