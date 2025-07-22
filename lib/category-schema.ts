import { z } from "zod";

export const categorySpecificationSchema = z
  .object({
    id: z.string().min(1, "Specification ID is required").optional(),
    name: z.string().min(1, "Specification name is required"),
    type: z.enum(["TEXT", "NUMBER", "SELECT", "BOOLEAN"]),
    required: z.boolean().default(false),
    unit: z.string().optional().nullable(),
    options: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "SELECT") {
        return data.options && data.options.length > 0;
      }
      return true;
    },
    {
      message: "SELECT type must have options",
      path: ["options"],
    }
  );

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(
      /^[a-z0-9\-_]+$/,
      "Slug must contain only lowercase letters, numbers, hyphens, and underscores"
    ),
  description: z.string().max(500, "Description too long").optional(),
  parentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  specifications: z.array(categorySpecificationSchema).default([]),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategorySpecification = z.infer<typeof categorySpecificationSchema>;
