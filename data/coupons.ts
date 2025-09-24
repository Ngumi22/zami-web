"use server";

import prisma from "@/lib/prisma";

export async function applyCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return { success: false, message: "Invalid coupon", amount: 0 };
  }

  if (!coupon.active || !coupon.expiresAt || coupon.expiresAt < new Date()) {
    return { success: false, message: "Coupon expired", amount: 0 };
  }

  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "FIXED") {
    discount = coupon.discountValue;
  }

  return { success: true, amount: discount };
}
