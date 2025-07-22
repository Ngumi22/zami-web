"use server";

import { Prisma, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import prisma from "./prisma";

export async function getAllUsers(): Promise<Prisma.UserGetPayload<{}>[]> {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCurrentUser(
  id: string
): Promise<Prisma.UserGetPayload<{}> | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function getCurrentUsers(): Promise<Prisma.UserGetPayload<{}>[]> {
  const users = await getAllUsers();
  if (!users || users.length === 0) {
    return redirect("/api/auth/login");
  }
  return users;
}

export async function createUser(data: {
  name: string;
  email: string;
  role?: Role;
}): Promise<Prisma.UserGetPayload<{}>> {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role ?? "USER",
    },
  });
  return user;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: Role;
  }
): Promise<Prisma.UserGetPayload<{}> | null> {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}
