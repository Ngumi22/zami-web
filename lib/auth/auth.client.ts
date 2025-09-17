import { twoFactorClient } from "better-auth/plugins";
import {
  anonymousClient,
  magicLinkClient,
  oneTapClient,
  passkeyClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    magicLinkClient(),
    passkeyClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    }),
  ],
});

export const { signIn, signOut, signUp, useSession, forgetPassword } =
  authClient;
