"use server";

import { revalidateTag } from "next/cache";
import { cacheTags } from "./cache-keys";
import {
  createCategorySchema,
  updateCategorySchema,
  categorySpecificationSchema,
} from "./category-schema";
import prisma from "./prisma";
import { Category, Prisma } from "@prisma/client";
import { ActionResult } from "./types";
import DOMPurify from "isomorphic-dompurify";
import { withAdminAuth } from "./auth-action";

/**
 * Prepares and validates category specifications from form data.
 * @param specs - The raw specifications data.
 * @returns An array of sanitized and structured specifications.
 */
function prepareSpecifications(specs: unknown) {
  const parsedSpecs = categorySpecificationSchema.array().safeParse(specs);
  if (!parsedSpecs.success) {
    throw new Error("Invalid specifications format");
  }

  return parsedSpecs.data.map((spec) => ({
    ...spec,
    id:
      spec.id ||
      `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: spec.type.toUpperCase(),
    options: spec.type === "SELECT" ? spec.options || [] : [],
  }));
}

/**
 * Creates a new category. The slug uniqueness check and creation are wrapped in a transaction
 * to prevent race conditions and ensure data integrity.
 */
export const createCategory = withAdminAuth(
  async (formData: FormData): Promise<ActionResult<Category>> => {
    try {
      const rawData = {
        name: DOMPurify.sanitize((formData.get("name") as string) || ""),
        slug: ((formData.get("slug") as string) || "").toLowerCase().trim(),
        description: DOMPurify.sanitize(
          (formData.get("description") as string) || ""
        ),
        image: (formData.get("image") as string) || "",
        isActive: formData.get("isActive") === "true",
        specifications: prepareSpecifications(
          JSON.parse((formData.get("specifications") as string) || "[]")
        ),
        parentId: (formData.get("parentId") as string) || null,
      };

      const validation = createCategorySchema.safeParse(rawData);
      if (!validation.success) {
        return {
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        };
      }

      const data = validation.data;

      const category = await prisma.$transaction(async (tx) => {
        const exists = await tx.category.findUnique({
          where: { slug: data.slug },
        });
        if (exists) {
          throw new Error("Slug already in use");
        }

        return tx.category.create({
          data: {
            ...data,
            specifications: data.specifications as any,
          },
        });
      });

      // Revalidate relevant cache tags
      revalidateTag(cacheTags.categoriesCollection());

      return {
        success: true,
        message: "Category created successfully",
        data: category,
      };
    } catch (error: any) {
      if (error.message === "Slug already in use") {
        return {
          success: false,
          message: "Slug already in use",
          errors: { slug: ["Slug must be unique"] },
        };
      }
      console.error("Error creating category:", error);
      return {
        success: false,
        message: "An unexpected error occurred while creating the category",
      };
    }
  }
);

/**
 * Updates an existing category. The slug uniqueness check and update are handled atomically
 * within a transaction to prevent race conditions.
 */
export const updateCategory = withAdminAuth(
  async (
    categoryId: string,
    formData: FormData
  ): Promise<ActionResult<Category>> => {
    const tStart = Date.now();

    try {
      // Step 1: Parse and sanitize input
      const rawData = {
        id: categoryId,
        name: DOMPurify.sanitize((formData.get("name") as string) || ""),
        slug: DOMPurify.sanitize(
          ((formData.get("slug") as string) || "").toLowerCase().trim()
        ),
        description: DOMPurify.sanitize(
          (formData.get("description") as string) || ""
        ),
        image: (formData.get("image") as string) || "",
        isActive: formData.get("isActive") === "true",
        specifications: prepareSpecifications(
          JSON.parse((formData.get("specifications") as string) || "[]")
        ),
        parentId: (formData.get("parentId") as string) || null,
      };

      // Step 2: Validate
      const validation = updateCategorySchema.safeParse(rawData);
      if (!validation.success) {
        return {
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        };
      }

      const data = validation.data;

      // Step 3: Run DB operations atomically
      const category = await prisma.$transaction(async (tx) => {
        // Check slug uniqueness (fast lookup)
        const exists = await tx.category.findFirst({
          where: { slug: data.slug, NOT: { id: categoryId } },
          select: { id: true },
        });
        if (exists) {
          throw { code: "SLUG_TAKEN", message: "Slug must be unique" };
        }

        // Update category
        return tx.category.update({
          where: { id: categoryId },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            image: data.image || null,
            isActive: data.isActive,
            specifications: data.specifications.map((spec: any) => ({
              ...spec,
              type: spec.type.toUpperCase(),
            })),
            parentId: data.parentId || null,
            updatedAt: new Date(),
          },
        });
      });

      // Step 4: Cache revalidation
      revalidateTag(cacheTags.category(categoryId));
      revalidateTag(cacheTags.categoriesCollection());

      console.info(`[updateCategory] Completed in ${Date.now() - tStart}ms`);

      return {
        success: true,
        message: "Category updated successfully",
        data: category,
      };
    } catch (error: any) {
      console.error("[updateCategory] Error:", {
        categoryId,
        error: error.message || error,
      });

      if (error.code === "SLUG_TAKEN") {
        return {
          success: false,
          message: "Slug already in use",
          errors: { slug: ["Slug must be unique"] },
        };
      }

      return {
        success: false,
        message: "Internal server error",
      };
    }
  }
);

/**
 * Deletes a category and all its nested children and products. The entire operation is
 * wrapped in a single transaction for atomicity. The recursive helper is nested
 * to ensure the correct transaction client is used.
 */
export const deleteCategory = withAdminAuth(
  async (id: string): Promise<ActionResult<null>> => {
    try {
      await prisma.$transaction(async (tx) => {
        /**
         * A recursive helper function to perform cascading deletion of a category and its descendants.
         * This function should be called within a Prisma transaction.
         * @param categoryId The ID of the category to delete.
         */
        const deleteCategoryAndChildren = async (categoryId: string) => {
          const categoryWithChildren = await tx.category.findUnique({
            where: { id: categoryId },
            select: {
              id: true,
              children: {
                select: {
                  id: true,
                },
              },
            },
          });

          if (!categoryWithChildren) {
            return;
          }

          for (const child of categoryWithChildren.children) {
            await deleteCategoryAndChildren(child.id);
          }

          await tx.product.deleteMany({
            where: { categoryId: categoryId },
          });

          await tx.category.delete({
            where: { id: categoryId },
          });
        };
        await deleteCategoryAndChildren(id);
      });

      revalidateTag(cacheTags.category(id));
      revalidateTag(cacheTags.categoriesCollection());

      return {
        success: true,
        message:
          "Category and all its nested children and products deleted successfully",
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return {
          success: false,
          message: `Database error: ${e.message}`,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred during category deletion.",
      };
    }
  }
);
