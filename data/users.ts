"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { User, Customer } from "@prisma/client";
import crypto from "crypto";

const INVITE_SECRET = process.env.INVITE_SECRET;
if (!INVITE_SECRET) throw new Error("INVITE_SECRET is required");

export async function createInviteToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHmac("sha256", INVITE_SECRET as string)
    .update(token)
    .digest("hex");

  if (token === tokenHash) throw new Error("Token collision detected");

  const expiresAt = new Date(Date.now() + 86400000);

  await prisma.allowedAdmin.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { tokenHash, expiresAt, used: false },
    create: { email, tokenHash, expiresAt, used: false },
  });

  return { token, expiresAt };
}

export async function validateInviteToken(email: string, encodedToken: string) {
  const token = decodeURIComponent(encodedToken);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;

  const invite = await prisma.allowedAdmin.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!invite) return null;

  const computedHash = crypto
    .createHmac("sha256", INVITE_SECRET as string)
    .update(token)
    .digest("hex");

  return invite.tokenHash === computedHash &&
    !invite.used &&
    invite.expiresAt > new Date()
    ? invite
    : null;
}

export async function markInviteAsUsed(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    await prisma.allowedAdmin.update({
      where: { email: normalizedEmail },
      data: { used: true },
    });
  } catch (error) {
    console.error("Error marking invite as used:", error);
    throw new Error("Failed to mark invite as used");
  }
}

export async function signUpUser({
  email,
  password,
  name,
  inviteToken,
}: {
  email: string;
  password: string;
  name: string;
  inviteToken: string;
}) {
  try {
    const invite = await validateInviteToken(email, inviteToken);

    if (!invite) {
      return {
        success: false,
        message: "Invalid or expired invite token.",
      };
    }

    await auth.api.signUpEmail({
      body: { email, password, name },
    });

    await markInviteAsUsed(email);

    return {
      success: true,
      message: "Account created. Please sign in.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message.includes("Unique constraint failed")
        ? "A user with this email already exists."
        : "Server error during sign-up.",
    };
  }
}

export const signInUser = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "User signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;
    console.error("Sign-in error:", e.message);
    return {
      success: false,
      message: "Invalid credentials or server error.",
    };
  }
};

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized: No session or invalid user");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  return {
    session,
    currentUser: user,
  };
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};
