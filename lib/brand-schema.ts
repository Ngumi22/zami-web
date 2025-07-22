import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(100, "Brand name too long")
    .regex(/^[a-zA-Z0-9\s\-_&()]+$/, "Brand name contains invalid characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(
      /^[a-z0-9\-_]+$/,
      "Slug must contain only lowercase letters, numbers, hyphens, and underscores"
    ),
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .transform((val) => val?.trim() || ""),
  logo: z
    .string()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        if (val.startsWith("/")) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid logo URL or path" }
    )
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.extend({
  id: z.string().min(1, "Brand ID is required"),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
