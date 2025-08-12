import { getCurrentUser } from "@/data/users";
import { redirect } from "next/navigation";
import { ActionResult } from "./types";
import { requireRateLimit } from "./ratelimit";

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

type ActionFunction<T> = (...args: any[]) => Promise<ActionResult<T>>;

export function withAdminAuth<T>(action: ActionFunction<T>): ActionFunction<T> {
  return async (...args: any[]): Promise<ActionResult<T>> => {
    const user = await requireAuth();
    if (!user) {
      return { success: false, message: "Sign In" };
    }
    await requireRateLimit({
      windowSec: 60,
      max: 10,
      identifier: user.id,
    });
    try {
      const result = await action(...args);
      return result;
    } catch (error) {
      console.error("Error in server action:", error);
      return { success: false, message: "Internal server error" };
    }
  };
}
