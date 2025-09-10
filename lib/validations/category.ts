// lib/schemas/category-schema.ts

import { z } from "zod";
import { CategorySpecificationType } from "@prisma/client";

// Regex for a valid MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ID format");

// Regex for a URL-friendly slug
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Schema for a single category specification.
 * This defines the template for a specification (e.g., "RAM", "Screen Size").
 */
export const categorySpecificationSchema = z.object({
  // Add a client-side only ID for drag-and-drop keying
  id: z.string().optional(),
  key: z
    .string()
    .min(1, "Key is required")
    .regex(slugRegex, "Key must be a URL-friendly slug (e.g., screen-size)"),
  label: z.string().min(1, "Label is required"),
  type: z.nativeEnum(CategorySpecificationType),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  unit: z.string().optional(),
  order: z.number().int().default(0),
});

/**
 * Base schema for category data.
 * Contains fields common to both creation and updates.
 */
const baseCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(
      slugRegex,
      "Slug must be a URL-friendly value (e.g., gaming-laptops)"
    ),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  isActive: z.preprocess((val) => val === true || val === "true", z.boolean()),
  parentId: objectIdSchema.nullable().optional(),
  // `specifications` is an array of the schema defined above.
  specifications: z.array(categorySpecificationSchema).default([]),
});

/**
 * Schema for CREATING a new category.
 * It uses a super refinement to enforce our core business rule.
 */
export const createCategorySchema = baseCategorySchema.superRefine(
  (data, ctx) => {
    // RULE: If a category has a parent (it's a sub-category),
    // it cannot have its own specifications.
    if (data.parentId && data.specifications.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specifications can only be defined for top-level categories.",
        path: ["specifications"], // This error will be associated with the 'specifications' field.
      });
    }
  }
);

/**
 * Schema for UPDATING an existing category.
 * It includes the category's `id` and also enforces the same business rule.
 */
export const updateCategorySchema = baseCategorySchema
  .extend({
    id: objectIdSchema,
  })
  .superRefine((data, ctx) => {
    if (data.parentId && data.specifications.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specifications can only be defined for top-level categories.",
        path: ["specifications"],
      });
    }
  });

export const categoryFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters long."),
    slug: z.string().min(2, "Slug is required."),
    description: z.string().optional(),
    image: z.string().url("Must be a valid URL.").or(z.literal("")).optional(),
    isActive: z.boolean().default(true),
    parentId: z
      .string()
      .regex(objectIdRegex, "Invalid Parent ID.")
      .optional()
      .or(z.literal("")),
    specifications: z.array(categorySpecificationSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.parentId && data.specifications.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specifications can only be defined for top-level categories.",
        path: ["specifications"],
      });
    }
  });

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
export type CategorySpecificationFormData = z.infer<
  typeof categorySpecificationSchema
>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
