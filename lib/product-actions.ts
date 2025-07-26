"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { productFormSchema, type ProductFormData } from "./schema";
import { Prisma } from "@prisma/client";
import z from "zod";
import { requireAuth } from "./auth-action";

type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

async function validateProductData(data: ProductFormData): Promise<{
  success: boolean;
  data?: ProductFormData;
  errors?: Record<string, string[]>;
}> {
  await requireAuth();
  try {
    const validatedData = productFormSchema.parse(data);

    const errors: Record<string, string[]> = {};

    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
      include: {
        children: true,
      },
    });

    if (!category) {
      errors.categoryId = ["Selected category does not exist."];
      console.error(
        `[VALIDATION ERROR] Category not found: ${validatedData.categoryId}`
      );
    }

    const brand = await prisma.brand.findUnique({
      where: { id: validatedData.brandId },
    });

    if (!brand) {
      errors.brandId = ["Selected brand does not exist."];
      console.error(
        `[VALIDATION ERROR] Brand not found: ${validatedData.brandId}`
      );
    }

    if (category) {
      for (const specDef of category.specifications) {
        const specValue = validatedData.specifications[specDef.id];

        if (specDef.required && (!specValue || specValue.trim() === "")) {
          errors[`specifications.${specDef.id}`] = [
            `${specDef.name} is required.`,
          ];
          console.error(
            `[VALIDATION ERROR] Required specification missing: ${specDef.name} (${specDef.id})`
          );
          continue;
        }

        if (specValue && specValue.trim() !== "") {
          if (specDef.type === "NUMBER") {
            const numValue = Number(specValue);
            if (isNaN(numValue)) {
              errors[`specifications.${specDef.id}`] = [
                `${specDef.name} must be a valid number.`,
              ];
              console.error(
                `[VALIDATION ERROR] Invalid number for ${specDef.name}: ${specValue}`
              );
            } else if (numValue < 0) {
              errors[`specifications.${specDef.id}`] = [
                `${specDef.name} must be a positive number.`,
              ];
              console.error(
                `[VALIDATION ERROR] Negative number for ${specDef.name}: ${numValue}`
              );
            }
          } else if (
            specDef.type === "SELECT" &&
            specDef.options &&
            !specDef.options.includes(specValue)
          ) {
            errors[`specifications.${specDef.id}`] = [
              `Please select a valid option for ${specDef.name}.`,
            ];
            console.error(
              `[VALIDATION ERROR] Invalid option for ${
                specDef.name
              }: ${specValue}. Valid options: ${specDef.options.join(", ")}`
            );
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
        console.error(`[VALIDATION ERROR] ${path}: ${err.message}`);
      });
      return { success: false, errors: fieldErrors };
    }

    console.error("[VALIDATION ERROR] Unexpected validation error:", error);
    return {
      success: false,
      errors: { general: ["An unexpected validation error occurred."] },
    };
  }
}

export async function createProduct(
  data: ProductFormData
): Promise<ActionResult> {
  await requireAuth();
  try {
    const validation = await validateProductData(data);
    if (!validation.success) {
      console.error("[CREATE PRODUCT] Validation failed:", validation.errors);
      return {
        success: false,
        message: "Validation failed. Please check your inputs and try again.",
        errors: validation.errors,
      };
    }

    const validatedData = validation.data!;

    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      console.error(
        `[CREATE PRODUCT] Slug already exists: ${validatedData.slug}`
      );
      return {
        success: false,
        message: "Product slug must be unique.",
        errors: { slug: ["A product with this slug already exists."] },
      };
    }

    const { categoryId, brandId, ...productData } = validatedData;

    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        specifications: productData.specifications || Prisma.JsonNull,
        category: { connect: { id: categoryId } },
        brand: { connect: { id: brandId } },
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Product "${newProduct.name}" created successfully!`,
    };
  } catch (error) {
    console.error("[CREATE PRODUCT] Database error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.error(
          `[CREATE PRODUCT] Unique constraint violation: ${error.meta?.target}`
        );
        return {
          success: false,
          message: "A product with this slug already exists.",
          errors: { slug: ["Slug must be unique."] },
        };
      }
    }

    return {
      success: false,
      message: "Failed to create product. Please try again later.",
    };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<ActionResult> {
  await requireAuth();
  try {
    if (!id) {
      console.error("[UPDATE PRODUCT] Invalid product ID provided");
      return {
        success: false,
        message: "Invalid product ID.",
        errors: { general: ["Invalid product ID."] },
      };
    }

    const validation = await validateProductData(data);
    if (!validation.success) {
      console.error(
        `[UPDATE PRODUCT] Validation failed for product ${id}:`,
        validation.errors
      );
      return {
        success: false,
        message: "Validation failed. Please check your inputs and try again.",
        errors: validation.errors,
      };
    }

    const validatedData = validation.data!;

    const slugConflict = await prisma.product.findFirst({
      where: { slug: validatedData.slug, NOT: { id } },
    });

    if (slugConflict) {
      console.error(
        `[UPDATE PRODUCT] Slug conflict for product ${id}: ${validatedData.slug}`
      );
      return {
        success: false,
        message: "Product slug must be unique.",
        errors: { slug: ["A product with this slug already exists."] },
      };
    }

    const { categoryId, brandId, ...productData } = validatedData;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        specifications: productData.specifications || Prisma.JsonNull,
        category: { connect: { id: categoryId } },
        brand: { connect: { id: brandId } },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return {
      success: true,
      message: `Product "${updatedProduct.name}" updated successfully!`,
    };
  } catch (error) {
    console.error(`[UPDATE PRODUCT] Database error for product ${id}:`, error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error(`[UPDATE PRODUCT] Product not found: ${id}`);
      return {
        success: false,
        message: "Product not found.",
        errors: { general: ["Product not found."] },
      };
    }

    return {
      success: false,
      message: "Failed to update product. Please try again later.",
    };
  }
}

export async function deleteProduct(id: string) {
  await requireAuth();
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error while deleting the product",
    };
  }
}
