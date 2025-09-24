import { customAlphabet } from "nanoid";
import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
    })
  ),
  subtotal: z.number().min(0),
  tax: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  paymentMethod: z.string().optional().default("UNKNOWN"),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  createdByAdmin: z.boolean().optional(),
  status: z
    .enum([
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional()
    .default("PENDING"),
  guest: z.boolean().optional().default(false),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

const nanoid = customAlphabet("1234567890ABCDEFGHJKLMNPQRSTUVWXYZ", 8);
export const generateOrderNumber = () => `ORD-${nanoid()}`;
