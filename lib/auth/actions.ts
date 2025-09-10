// lib/actions.ts
"use server";

import {
  hashPassword,
  verifyPassword,
  createSession,
  logout,
  requireAuth,
} from "./customer-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import prisma from "../prisma";
import {
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email";
import { randomBytes } from "crypto";

const EXPIRES_IN = 30 * 24 * 60 * 60; // 30 days

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal("")),
});

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
});

// Response types for better type safety
export type ActionResponse = {
  success?: string;
  error?: string;
  redirect?: string;
};

// Auth Actions with proper parameter types
export async function signup(
  email: string,
  name: string,
  password: string
): Promise<ActionResponse> {
  try {
    const validatedData = signupSchema.parse({ email, name, password });

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: validatedData.email },
    });

    if (existingCustomer) {
      return { error: "Email already exists" };
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create customer
    const hashedPassword = await hashPassword(validatedData.password);
    const customer = await prisma.customer.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        authProvider: "EMAIL",
        status: "PENDING_VERIFICATION",
        verificationToken,
        verificationTokenExpires,
      },
    });

    // Create wishlist
    await prisma.wishlist.create({
      data: {
        customerId: customer.id,
      },
    });

    // Send verification email
    await sendVerificationEmail(customer.email, verificationToken);

    return {
      success: "Account created! Please check your email for verification.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error("Signup error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function login(
  email: string,
  password: string
): Promise<ActionResponse> {
  try {
    const validatedData = loginSchema.parse({ email, password });

    const customer = await prisma.customer.findUnique({
      where: { email: validatedData.email },
    });

    if (!customer || !customer.password) {
      return { error: "Invalid email or password" };
    }

    // Check if account is locked
    if (customer.lockedUntil && customer.lockedUntil > new Date()) {
      return {
        error: "Account is temporarily locked. Please try again later.",
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      customer.password
    );
    if (!isValidPassword) {
      // Increment login attempts
      const attempts = customer.loginAttempts + 1;
      let lockedUntil = null;

      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await prisma.customer.update({
        where: { id: customer.id },
        data: { loginAttempts: attempts, lockedUntil },
      });

      return { error: "Invalid email or password" };
    }

    // Check if email is verified
    if (!customer.emailVerified) {
      return { error: "Please verify your email before logging in" };
    }

    // Check if account is active
    if (customer.status !== "ACTIVE") {
      return { error: "Your account is not active. Please contact support." };
    }

    // Create session
    const token = await createSession(customer.id);
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Reset login attempts and update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    return { success: "Login successful!", redirect: "/account" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function googleSignIn(): Promise<ActionResponse> {
  try {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
      {
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `http://localhost:3000/api/auth/callback/google`,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
      }
    )}`;

    return { redirect: googleAuthUrl };
  } catch (error) {
    console.error("Google signin error:", error);
    return { error: "Failed to initiate Google sign in" };
  }
}

export async function signOut(): Promise<ActionResponse> {
  try {
    await logout();
    return { success: "Signed out successfully", redirect: "/auth/login" };
  } catch (error) {
    console.error("Signout error:", error);
    return { error: "Failed to sign out" };
  }
}

// Email verification action
export async function verifyEmail(token: string): Promise<ActionResponse> {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!customer) {
      return { error: "Invalid or expired verification token" };
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        emailVerified: true,
        status: "ACTIVE",
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(customer.email);

    return { success: "Email verified successfully! You can now login." };
  } catch (error) {
    console.error("Email verification error:", error);
    return { error: "Failed to verify email" };
  }
}

// Password reset actions
export async function requestPasswordReset(
  email: string
): Promise<ActionResponse> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      // Don't reveal whether email exists
      return {
        success:
          "If an account exists with this email, you will receive a password reset link.",
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(customer.email, resetToken);

    return { success: "Password reset link sent to your email." };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Failed to process password reset request" };
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<ActionResponse> {
  try {
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    const customer = await prisma.customer.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!customer) {
      return { error: "Invalid or expired reset token" };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    return {
      success:
        "Password reset successfully. You can now login with your new password.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to reset password" };
  }
}

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const customer = await requireAuth();
    const validatedData = updateProfileSchema.parse({
      name: formData.get("name"),
      phone: formData.get("phone"),
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: validatedData,
    });

    return { success: "Profile updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to update profile" };
  }
}

export async function deleteAccount() {
  try {
    const customer = await requireAuth();

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        status: "INACTIVE",
        email: `deleted-${Date.now()}@${customer.email}`,
      },
    });

    await prisma.customerSession.deleteMany({
      where: { customerId: customer.id },
    });

    await logout();
    return { success: "Account deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete account" };
  }
}

// Address Actions
export async function addAddress(prevState: any, formData: FormData) {
  try {
    const customer = await requireAuth();
    const validatedData = addressSchema.parse({
      fullName: formData.get("fullName"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
      phone: formData.get("phone"),
      isDefault: formData.get("isDefault") === "on",
    });

    // If setting as default, remove default from other addresses
    if (validatedData.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    await prisma.customerAddress.create({
      data: {
        ...validatedData,
        customerId: customer.id,
      },
    });

    return { success: "Address added successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to add address" };
  }
}

export async function updateAddress(
  id: string,
  prevState: any,
  formData: FormData
) {
  try {
    const customer = await requireAuth();
    const validatedData = addressSchema.parse({
      fullName: formData.get("fullName"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      city: formData.get("city"),
      state: formData.get("state"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
      phone: formData.get("phone"),
      isDefault: formData.get("isDefault") === "on",
    });

    // Verify address belongs to customer
    const address = await prisma.customerAddress.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!address) {
      return { error: "Address not found" };
    }

    // If setting as default, remove default from other addresses
    if (validatedData.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    await prisma.customerAddress.update({
      where: { id },
      data: validatedData,
    });

    return { success: "Address updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to update address" };
  }
}

export async function deleteAddress(id: string) {
  try {
    const customer = await requireAuth();

    // Verify address belongs to customer
    const address = await prisma.customerAddress.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!address) {
      return { error: "Address not found" };
    }

    await prisma.customerAddress.delete({
      where: { id },
    });

    return { success: "Address deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete address" };
  }
}

// Wishlist Actions
export async function addToWishlist(productId: string) {
  try {
    const customer = await requireAuth();

    const wishlist = await prisma.wishlist.findUnique({
      where: { customerId: customer.id },
    });

    if (!wishlist) {
      return { error: "Wishlist not found" };
    }

    // Check if product is already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (existingItem) {
      return { error: "Product already in wishlist" };
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return { success: "Product added to wishlist" };
  } catch (error) {
    return { error: "Failed to add to wishlist" };
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const customer = await requireAuth();

    const wishlist = await prisma.wishlist.findUnique({
      where: { customerId: customer.id },
    });

    if (!wishlist) {
      return { error: "Wishlist not found" };
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return { success: "Product removed from wishlist" };
  } catch (error) {
    return { error: "Failed to remove from wishlist" };
  }
}
