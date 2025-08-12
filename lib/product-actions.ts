"use server";
// lib/actions/product-actions.ts
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { productFormSchema, type ProductFormData } from "./schema";
import { requireAuth } from "./auth-action";
import { requireRateLimit } from "./ratelimit";

type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Simple logger - replace with console if needed
const log = (
  level: "error" | "warn" | "info",
  message: string,
  context?: any
) => {
  if (process.env.NODE_ENV === "production") {
    console[level](
      JSON.stringify({ level, message, context, timestamp: new Date() })
    );
  } else {
    console[level](`[${level.toUpperCase()}] ${message}`, context);
  }
};

const validateProductData = async (data: ProductFormData) => {
  try {
    // Basic schema validation
    const validatedData = productFormSchema.parse(data);

    // Check category and brand in parallel
    const [category, brand] = await Promise.all([
      prisma.category.findUnique({ where: { id: validatedData.categoryId } }),
      prisma.brand.findUnique({ where: { id: validatedData.brandId } }),
    ]);

    const errors: Record<string, string[]> = {};

    if (!category) errors.categoryId = ["Invalid category"];
    if (!brand) errors.brandId = ["Invalid brand"];

    if (Object.keys(errors).length > 0) {
      log("warn", "Validation failed", errors);
      return { success: false, errors };
    }

    return { success: true, data: validatedData };
  } catch (error) {
    log("error", "Validation error", error);
    return { success: false, errors: { general: ["Invalid data"] } };
  }
};

const withAuthWrapper = async (action: () => Promise<ActionResult>) => {
  try {
    const user = await requireAuth();
    if (!user) return { success: false, message: "Authentication required" };

    await requireRateLimit({
      windowSec: 60,
      max: 10,
      identifier: user.id,
    });

    return await action();
  } catch (error) {
    log("error", "Auth/rate limit error", error);
    return { success: false, message: "Request blocked" };
  }
};

export const createProduct = async (data: ProductFormData) =>
  withAuthWrapper(async () => {
    const validation = await validateProductData(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      };
    }

    try {
      const newProduct = await prisma.product.create({
        data: {
          ...validation.data!,
          specifications: validation.data!.specifications || {},
        },
      });

      // Update caches
      revalidatePath("/admin/products");
      revalidateTag("products");

      return {
        success: true,
        message: `Created ${newProduct.name}`,
      };
    } catch (error) {
      log("error", "Create product failed", error);
      return {
        success: false,
        message: "Slug already exists or server error",
      };
    }
  });

export const updateProduct = async (id: string, data: ProductFormData) =>
  withAuthWrapper(async () => {
    const validation = await validateProductData(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      };
    }

    try {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...validation.data!,
          specifications: validation.data!.specifications || {},
        },
      });

      // Update caches
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}`);
      revalidateTag("products");

      return {
        success: true,
        message: `Updated ${updatedProduct.name}`,
      };
    } catch (error) {
      log("error", "Update product failed", { id, error });
      return {
        success: false,
        message: "Product not found or server error",
      };
    }
  });

export const deleteProduct = async (id: string) =>
  withAuthWrapper(async () => {
    try {
      await prisma.product.delete({ where: { id } });

      // Update caches
      revalidatePath("/admin/products");
      revalidateTag("products");

      return {
        success: true,
        message: "Product deleted",
      };
    } catch (error) {
      log("error", "Delete product failed", { id, error });
      return {
        success: false,
        message: "Product not found or server error",
      };
    }
  });
