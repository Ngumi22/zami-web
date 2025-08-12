import { z } from "zod";

const brandIdSchema = z.object({
  id: z.string().min(1),
});

// Delete: only id
export const deleteBrandSchema = brandIdSchema;

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

export const baseBrandSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional().default(""),
  logo: z.string().url("Logo must be a valid URL").optional().default(""),
  isActive: z.boolean().optional().default(true),
});

/**
 * Defines the validation schema for the brand form.
 * This is the single source of truth for both client and server validation.
 */
export const brandSchema = z.object({
  // The 'id' is optional because it only exists when updating a brand.
  id: z.string().optional(),

  // The brand name is required and must be at least 2 characters long.
  name: z
    .string()
    .min(2, { message: "Brand name must be at least 2 characters." }),

  // The slug is also required and must follow a specific format (lowercase, hyphens).
  slug: z
    .string()
    .min(2, { message: "Slug is required." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase with words separated by hyphens.",
    }),

  // The description is optional.
  description: z.string().max(500).optional().default(""),

  // The logo must be a valid URL but is optional. It can be an empty string.
  logo: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),

  // The active status defaults to true.
  isActive: z.boolean().default(true),
});

// We can infer the TypeScript type directly from the schema.
export type BrandFormValues = z.infer<typeof brandSchema>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
