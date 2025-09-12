import { getUser, updateUser } from "@/lib/auth/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (!token || !userId) {
      return NextResponse.json(
        { message: "Missing token or user ID." },
        { status: 400 }
      );
    }

    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified." },
        { status: 400 }
      );
    }

    if (!user.verificationToken || !user.verificationTokenExpires) {
      return NextResponse.json(
        { message: "Invalid verification request." },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpires < new Date()) {
      return NextResponse.json(
        { message: "Verification token has expired." },
        { status: 400 }
      );
    }

    if (user.verificationToken !== token) {
      return NextResponse.json(
        { message: "Invalid verification token." },
        { status: 401 }
      );
    }

    await updateUser(userId);

    return NextResponse.redirect(new URL("/account", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        message: "Error verifying email.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
