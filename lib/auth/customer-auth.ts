"use server";
import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "../prisma";
import { unstable_cache } from "next/cache";
import type { Customer } from "@prisma/client";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export async function createSession(customerId: string): Promise<string> {
  const token = await new SignJWT({ customerId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);

  // Store session in database
  await prisma.customerSession.create({
    data: {
      customerId,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return token;
}

export async function verifySession(
  token: string
): Promise<{ customerId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { customerId: payload.customerId as string };
  } catch {
    return null;
  }
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  return await prisma.customer.findUnique({
    where: { id: session.customerId, status: "ACTIVE" },
  });
}

export const getAddresses = unstable_cache(
  async (customer: Customer) => {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: { isDefault: "desc" },
    });

    return addresses;
  },
  ["customer-addresses"],
  { tags: ["customer-addresses"] }
);

export const getOrders = unstable_cache(
  async (customer: Customer) => {
    // Fetch recent orders
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return orders;
  },
  ["customer-orders"],
  { tags: ["customer-orders"] }
);

export async function requireAuth() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/auth/login");
  }
  return customer;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (token) {
    await prisma.customerSession.deleteMany({
      where: { token },
    });
  }
  cookieStore.delete("session");
}
