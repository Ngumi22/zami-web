"use server";

import {
  processOrderCreation,
  type CreateOrderInput,
} from "@/lib/order-creation";

export async function checkoutAction(input: CreateOrderInput) {
  try {
    const result = await processOrderCreation(input);
    if (!result.success) {
      throw new Error(result.error || "Failed to create order");
    }
    return { success: true, order: result.order };
  } catch (error) {
    console.error("CheckoutAction error:", error);
    return { success: false, error: (error as Error).message };
  }
}
