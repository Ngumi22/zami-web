"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  updateOrderSchema,
  statusTransitionSchema,
  createOrderSchema,
  CreateOrderInput,
} from "./order-schema";
import { Order, OrderStatus } from "@prisma/client";
import { ActionResult } from "./types";

import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890ABCDEFGHJKLMNPQRSTUVWXYZ", 8);
const generateOrderNumber = () => `ORD-${nanoid()}`;

import DOMPurify from "isomorphic-dompurify";

function isValidStatusTransition(from: string, to: string): boolean {
  const transitions: Record<string, string[]> = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: ["COMPLETED", "REFUNDED"],
    COMPLETED: ["REFUNDED"],
    CANCELLED: [],
    REFUNDED: [],
  };
  return transitions[from]?.includes(to) || false;
}

function calculateOrderTotals(
  items: any[],
  tax: number,
  shipping: number,
  discount = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + tax + shipping - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// --- Update Order ---

export async function updateOrder(
  orderId: string,
  formData: FormData
): Promise<ActionResult<Order>> {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existingOrder) return { success: false, message: "Order not found" };

    const rawData = {
      id: orderId,
      customerId: DOMPurify.sanitize(
        (formData.get("customerId") as string) || ""
      ),
      customerName: DOMPurify.sanitize(
        (formData.get("customerName") as string) || ""
      ),
      customerEmail: DOMPurify.sanitize(
        (formData.get("customerEmail") as string) || ""
      ),
      status: (formData.get("status") as string) || existingOrder.status,
      items: JSON.parse((formData.get("items") as string) || "[]"),
      subtotal: parseFloat((formData.get("subtotal") as string) || "0"),
      tax: parseFloat((formData.get("tax") as string) || "0"),
      shipping: parseFloat((formData.get("shipping") as string) || "0"),
      discount: parseFloat((formData.get("discount") as string) || "0"),
      total: parseFloat((formData.get("total") as string) || "0"),
      shippingAddress: JSON.parse(
        (formData.get("shippingAddress") as string) || "{}"
      ),
      paymentMethod: DOMPurify.sanitize(
        (formData.get("paymentMethod") as string) || ""
      ),
      paymentStatus:
        (formData.get("paymentStatus") as string) ||
        existingOrder.paymentStatus,
      notes: DOMPurify.sanitize((formData.get("notes") as string) || ""),
      trackingNumber: DOMPurify.sanitize(
        (formData.get("trackingNumber") as string) || ""
      ),
      cancelReason: DOMPurify.sanitize(
        (formData.get("cancelReason") as string) || ""
      ),
    };

    if (
      rawData.status !== existingOrder.status &&
      !isValidStatusTransition(existingOrder.status, rawData.status)
    ) {
      return {
        success: false,
        message: `Invalid status transition from ${existingOrder.status} to ${rawData.status}`,
        errors: {
          status: [
            `Cannot change status from ${existingOrder.status} to ${rawData.status}`,
          ],
        },
      };
    }

    const { subtotal, total } = calculateOrderTotals(
      rawData.items,
      rawData.tax,
      rawData.shipping,
      rawData.discount
    );

    rawData.subtotal = subtotal;
    rawData.total = total;

    const validationResult = updateOrderSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const timestamps: Partial<Order> = {};
    if (
      rawData.status === OrderStatus.SHIPPED &&
      existingOrder.status !== OrderStatus.SHIPPED
    )
      timestamps.shippedAt = new Date();
    if (
      rawData.status === OrderStatus.DELIVERED &&
      existingOrder.status !== OrderStatus.DELIVERED
    )
      timestamps.deliveredAt = new Date();
    if (
      rawData.status === OrderStatus.COMPLETED &&
      existingOrder.status !== OrderStatus.COMPLETED
    )
      timestamps.completedAt = new Date();
    if (
      rawData.status === OrderStatus.CANCELLED &&
      existingOrder.status !== OrderStatus.CANCELLED
    )
      timestamps.cancelledAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...validationResult.data,
        paymentStatus: validationResult.data
          .paymentStatus as Order["paymentStatus"],
        ...timestamps,
      },
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      success: false,
      message: "Unexpected error while updating order",
    };
  }
}

// --- Update Order Status ---

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  reason?: string
): Promise<ActionResult<Order>> {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existingOrder) return { success: false, message: "Order not found" };

    const validation = statusTransitionSchema.safeParse({
      orderId,
      fromStatus: existingOrder.status,
      toStatus: newStatus,
      reason,
    });

    if (
      !validation.success ||
      !isValidStatusTransition(existingOrder.status, newStatus)
    ) {
      return {
        success: false,
        message: `Invalid status transition from ${existingOrder.status} to ${newStatus}`,
      };
    }

    const timestamps: Partial<Order> = {};
    if (newStatus === "SHIPPED") timestamps.shippedAt = new Date();
    if (newStatus === "DELIVERED") timestamps.deliveredAt = new Date();
    if (newStatus === "COMPLETED") timestamps.completedAt = new Date();
    if (newStatus === "CANCELLED") timestamps.cancelledAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus as OrderStatus,
        cancelReason: reason || undefined,
        ...timestamps,
      },
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: "Unexpected error while updating order status",
    };
  }
}

export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid order data");

  // Prevent duplicate purchases
  const existing = await prisma.order.findFirst({
    where: {
      customerId: parsed.data.customerId,
      items: parsed.data.items,
      total: parsed.data.total,
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60), // within last 1 minute
      },
    },
  });
  if (existing)
    throw new Error("Duplicate order detected. Please wait a moment.");

  // Create order and update products in transaction
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        ...parsed.data,
        orderNumber: generateOrderNumber(),
      },
    });

    await Promise.all(
      parsed.data.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            sales: { increment: item.quantity },
            stock: { decrement: item.quantity },
          },
        })
      )
    );

    return order;
  });

  return result;
}

export async function refundOrder(
  orderId: string,
  reason: string
): Promise<ActionResult<Order>> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order not found" };

    if (order.paymentStatus !== "PAID") {
      return { success: false, message: "Only paid orders can be refunded." };
    }

    const refunded = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
          cancelReason: reason,
        },
      });

      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              sales: { decrement: item.quantity },
              stock: { increment: item.quantity },
            },
          })
        )
      );

      return updatedOrder;
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Order refunded successfully",
      data: refunded,
    };
  } catch (error) {
    console.error("Refund error:", error);
    return {
      success: false,
      message: "Failed to process refund",
    };
  }
}
