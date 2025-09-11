"use server";

import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth/auth.client";

export const signInUser = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    const e = error as Error;
    return { success: false, message: e.message || "Failed to sign in" };
  }
};

export const signUpUser = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    return { success: true, message: "Signed up successfully" };
  } catch (error) {
    const e = error as Error;
    return { success: false, message: e.message || "Failed to sign up" };
  }
};

export const handleLoginWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: process.env.BETTER_AUTH_URL,
  });
};
