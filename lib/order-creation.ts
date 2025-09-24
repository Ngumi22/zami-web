"use server";
import prisma from "@/lib/prisma";
import { requireAuth } from "./auth-action";
import { requireRateLimit } from "./ratelimit";
import type { CartItem } from "@/hooks/use-cart-store";
import { Customer } from "@prisma/client";
import {
  CreateOrderInput,
  createOrderSchema,
  generateOrderNumber,
} from "./order-utils";

export interface OrderCreationResult {
  success: boolean;
  order?: any;
  error?: string;
}

export async function processOrderCreation(
  input: CreateOrderInput & { createdByAdmin?: boolean }
): Promise<OrderCreationResult> {
  try {
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid order data" };
    }
    const payload = parsed.data;

    const {
      customerId,
      customerName,
      customerEmail,
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      couponCode,
      notes,
      status,
      guest,
      createdByAdmin,
    } = payload;

    if (customerId) {
      const existing = await prisma.order.findFirst({
        where: {
          customerId,
          total,
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60),
          },
        },
      });
      if (existing) {
        return {
          success: false,
          error: "Duplicate order detected. Please wait a moment.",
        };
      }
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      let couponRecord = null;
      if (couponCode) {
        couponRecord = await tx.coupon.findUnique({
          where: { code: couponCode },
        });
        if (!couponRecord) throw new Error("Invalid coupon code");
        if (!couponRecord.active) throw new Error("Coupon is not active");
        if (couponRecord.expiresAt && couponRecord.expiresAt < new Date()) {
          throw new Error("Coupon has expired");
        }
        if (
          couponRecord.maxUsage !== null &&
          couponRecord.usedCount >= couponRecord.maxUsage
        ) {
          throw new Error("Coupon usage limit exceeded");
        }
      }

      const productIds = Array.from(new Set(items.map((it) => it.productId)));
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      const orderItems = items.map((it) => {
        const prod = productMap.get(it.productId);
        return {
          productId: it.productId,
          productName: prod?.name ?? "Unknown Product",
          variantId: it.variantId,
          variantName: undefined,
          quantity: it.quantity,
          price: it.price,
          total: Number((it.price * it.quantity).toFixed(2)),
          sku:
            Array.isArray(prod?.variants) && prod?.variants.length > 0
              ? (prod.variants[0] as any)?.sku ?? undefined
              : undefined,
        };
      });

      const orderData: any = {
        orderNumber: generateOrderNumber(),
        status: createdByAdmin ? "COMPLETED" : status,
        paymentStatus: createdByAdmin ? "PAID" : "PENDING",
        items: { set: orderItems },
        shippingAddress: {
          fullName: customerName ?? "Unknown",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        billingAddress: null,
        subtotal: Number(subtotal),
        tax: Number(tax ?? 0),
        shipping: Number(shipping ?? 0),
        discount: Number((subtotal - total).toFixed(2)),
        total: Number(total),
        paymentMethod: paymentMethod ?? "UNKNOWN",
        notes: notes ?? undefined,
        customerId: customerId ?? undefined,
        customerName,
        customerEmail,
        guest: !!guest,
      };

      if (couponRecord) {
        orderData.coupon = { connect: { id: couponRecord.id } };
        orderData.couponCode = couponRecord.code;
      }

      const createdOrder = await tx.order.create({ data: orderData });

      await Promise.all(
        items.map((it) =>
          tx.product.update({
            where: { id: it.productId },
            data: {
              stock: { decrement: it.quantity },
              sales: { increment: it.quantity },
            },
          })
        )
      );

      if (couponRecord) {
        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: {
            usedCount: (couponRecord.usedCount ?? 0) + 1,
          },
        });
      }

      return createdOrder;
    });

    return { success: true, order: createdOrder };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Order creation failed" };
  }
}

export async function createOrder(
  input: CreateOrderInput
): Promise<OrderCreationResult> {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Sign In" };

  await requireRateLimit({
    windowSec: 60,
    max: 10,
    identifier: user.id,
  });

  return processOrderCreation({
    ...input,
    createdByAdmin: true,
  } as CreateOrderInput & { createdByAdmin?: boolean });
}

export async function checkoutFromCart(
  cartItems: CartItem[],
  customer: Customer,
  couponCode?: string
): Promise<OrderCreationResult> {
  if (!cartItems.length) {
    return { success: false, error: "Cart is empty" };
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.finalPrice) * item.quantity,
    0
  );

  let discount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    if (coupon) {
      discount =
        coupon.discountType === "PERCENTAGE"
          ? (subtotal * coupon.discountValue) / 100
          : coupon.discountValue;
    }
  }

  const total = Number((subtotal - discount).toFixed(2));
  const tax = 0;
  const shipping = 0;

  const items = cartItems.map((ci) => ({
    productId: ci.id,
    variantId: ci.variantId,
    quantity: ci.quantity,
    price: ci.finalPrice,
  }));

  return processOrderCreation({
    customerId: customer.id ?? undefined,
    customerName: customer.name,
    customerEmail: customer.email,
    items,
    subtotal,
    tax,
    shipping,
    total,
    paymentMethod: "PENDING",
    couponCode,
    guest: !customer.id,
    status: "PENDING",
  });
}
