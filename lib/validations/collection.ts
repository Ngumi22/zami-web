import { z } from "zod";

export const collectionCreateSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(100, "Slug must be less than 100 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase with hyphens only"
      ),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    type: z.enum(["STATIC", "DYNAMIC", "FLASH_SALE"]),
    isActive: z.boolean().default(true),
    startDate: z.coerce
      .date()
      .optional()
      .nullable()
      .refine((date) => !date || date > new Date(), {
        message: "Start date must be in the future",
      }),
    endDate: z.coerce
      .date()
      .optional()
      .nullable()
      .refine((date) => !date || date > new Date(), {
        message: "End date must be in the future",
      }),
    productIds: z
      .array(z.string())
      .min(1, "At least one product is required")
      .max(50, "Cannot add more than 50 products at once"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type CollectionCreateInput = z.infer<typeof collectionCreateSchema>;
