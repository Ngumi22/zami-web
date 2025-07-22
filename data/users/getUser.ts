import { User } from "@/lib/types";
import { redirect } from "next/navigation";

const mockUsers: User[] = [
  {
    id: "1",
    email: "peter@gmail.com",
    name: "Peter",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "pan@gmail.com",
    name: "pan",
    role: "user",
    createdAt: new Date(),
  },
];

export async function getUsers() {
  return await mockUsers;
}

export async function getCurrentUsers() {
  const users = await mockUsers;
  if (!users) {
    return redirect("/api/auth/login");
  }
  return users;
}

export async function getCurrentUser(id: string) {
  return mockUsers.find((u) => u.id === id);
}
