import { getCurrentUser } from "@/data/users";
import { redirect } from "next/navigation";

export async function requireAuth() {
  try {
    const { currentUser } = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    return currentUser;
  } catch {
    redirect("/login");
  }
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admins only");
  }

  return user;
}
