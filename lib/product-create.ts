// lib/actions/product-actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { productFormSchema, type ProductFormData } from "./schema";
import z from "zod";

// Define proper return type
type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Helper to get parent category with specifications
const getParentCategoryWithSpecs = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true },
  });

  return category?.parent || category;
};

export const createProduct = async (
  data: ProductFormData
): Promise<ActionResult> => {
  try {
    const validatedData = productFormSchema.parse(data);

    // Get parent category to transform specifications
    const parentCategory = await getParentCategoryWithSpecs(
      validatedData.categoryId
    );
    const parentSpecs = parentCategory?.specifications || [];

    // Transform specifications from ID-based to name-based
    const transformedSpecifications: Record<string, string> = {};

    for (const [specId, value] of Object.entries(
      validatedData.specifications || {}
    )) {
      const spec = parentSpecs.find((s: any) => s.id === specId);
      if (spec && value) {
        transformedSpecifications[spec.name] = value;
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        ...validatedData,
        specifications: transformedSpecifications,
      },
    });

    revalidatePath("/admin/products");
    revalidateTag("products");

    return {
      success: true,
      message: `Created ${newProduct.name}`,
    };
  } catch (error) {
    console.error("Create product failed:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = [err.message];
      });

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    return {
      success: false,
      message: "Failed to create product",
    };
  }
};

export const updateProduct = async (
  id: string,
  data: ProductFormData
): Promise<ActionResult> => {
  try {
    const validatedData = productFormSchema.parse(data);

    // Get parent category to transform specifications
    const parentCategory = await getParentCategoryWithSpecs(
      validatedData.categoryId
    );
    const parentSpecs = parentCategory?.specifications || [];

    // Transform specifications from ID-based to name-based
    const transformedSpecifications: Record<string, string> = {};

    for (const [specId, value] of Object.entries(
      validatedData.specifications || {}
    )) {
      const spec = parentSpecs.find((s: any) => s.id === specId);
      if (spec && value) {
        transformedSpecifications[spec.name] = value;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData,
        specifications: transformedSpecifications,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidateTag("products");

    return {
      success: true,
      message: `Updated ${updatedProduct.name}`,
    };
  } catch (error) {
    console.error("Update product failed:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = [err.message];
      });

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    return {
      success: false,
      message: "Failed to update product",
    };
  }
};
