"use server";

import { revalidatePath } from "next/cache";
import { createCategorySchema, updateCategorySchema } from "./category-schema";
import prisma from "./prisma";
import { Category } from "@prisma/client";
import { ActionResult } from "./types";
import DOMPurify from "isomorphic-dompurify";
import { requireAuth } from "./auth-action";

function prepareSpecifications(specs: any[]) {
  return specs.map((spec) => ({
    ...spec,
    id:
      spec.id ||
      `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: spec.type.toUpperCase(),
    options: spec.type === "SELECT" ? spec.options || [] : [],
  }));
}

export async function createCategory(
  formData: FormData
): Promise<ActionResult<Category>> {
  await requireAuth();
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

    const exists = await prisma.category.findUnique({
      where: { slug: validation.data.slug },
    });

    if (exists) {
      return {
        success: false,
        message: "Slug already in use",
        errors: { slug: ["Slug must be unique"] },
      };
    }

    const category = await prisma.category.create({
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        image: validation.data.image || null,
        isActive: validation.data.isActive,
        specifications: {
          set: validation.data.specifications.map((spec: any) => ({
            ...spec,
            type: spec.type.toUpperCase(),
          })),
        },
        parentId: validation.data.parentId || null,
      },
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category created successfully",
      data: category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

export async function updateCategory(
  categoryId: string,
  formData: FormData
): Promise<ActionResult<Category>> {
  await requireAuth();
  try {
    const rawData = {
      id: categoryId,
      name: (formData.get("name") as string) || "",
      slug: ((formData.get("slug") as string) || "").toLowerCase().trim(),
      description: (formData.get("description") as string) || "",
      image: (formData.get("image") as string) || "",
      isActive: formData.get("isActive") === "true",
      specifications: prepareSpecifications(
        JSON.parse((formData.get("specifications") as string) || "[]")
      ),
      parentId: (formData.get("parentId") as string) || null,
    };

    const validation = updateCategorySchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const exists = await prisma.category.findFirst({
      where: {
        slug: validation.data.slug,
        NOT: { id: categoryId },
      },
    });

    if (exists) {
      return {
        success: false,
        message: "Slug already in use",
        errors: { slug: ["Slug must be unique"] },
      };
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        image: validation.data.image || null,
        isActive: validation.data.isActive,
        specifications: validation.data.specifications.map((spec: any) => ({
          ...spec,
          type: spec.type.toUpperCase(),
        })),
        parentId: validation.data.parentId || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category updated successfully",
      data: category,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult<null>> {
  await requireAuth();
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      message: "Unexpected error while deleting the category",
    };
  }
}
