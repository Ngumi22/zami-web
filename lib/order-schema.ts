import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity too high"),
  price: z.number().min(0, "Price must be positive"),
  total: z.number().min(0, "Total must be positive"),
  sku: z.string().optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Name too long"),
  addressLine1: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address too long"),
  addressLine2: z.string().max(200, "Address too long").optional(),
  city: z.string().min(1, "City is required").max(100, "City name too long"),
  state: z.string().min(1, "State is required").max(100, "State name too long"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code too long"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country name too long"),
  phone: z.string().max(20, "Phone number too long").optional(),
});

export const updateOrderSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  status: z.enum(
    [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "COMPLETED",
      "REFUNDED",
    ],
    {
      errorMap: () => ({ message: "Invalid order status" }),
    }
  ),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  tax: z.number().min(0, "Tax must be positive"),
  shipping: z.number().min(0, "Shipping must be positive"),
  discount: z.number().min(0, "Discount must be positive").default(0),
  total: z.number().min(0, "Total must be positive"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  notes: z.string().max(1000, "Notes too long").optional(),
  trackingNumber: z.string().max(100, "Tracking number too long").optional(),
  cancelReason: z.string().max(500, "Cancel reason too long").optional(),
});

export const statusTransitionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  fromStatus: z.string(),
  toStatus: z.string(),
  reason: z.string().max(500, "Reason too long").optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  shippingAddress: shippingAddressSchema,
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type StatusTransition = z.infer<typeof statusTransitionSchema>;
