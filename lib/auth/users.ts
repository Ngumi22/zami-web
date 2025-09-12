"use server";

import { auth } from "@/lib/auth";
import prisma from "../prisma";

export const getUser = async (userId: string) => {
  try {
    const user = await prisma.customer.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error(error);
  }
};

export const updateUser = async (userId: string) => {
  try {
    await prisma.customer.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        status: "ACTIVE",
      },
    });
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    return { success: false, message: "Sorry could not sign you in" };
  }
};

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
