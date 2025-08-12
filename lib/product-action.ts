"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { productFormSchema, type ProductFormData } from "./schema";
import { Prisma } from "@prisma/client";
import { requireAuth } from "./auth-action";
import { requireRateLimit } from "./ratelimit";
import { cacheTags } from "./cache-keys";

type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createProduct(
  data: ProductFormData
): Promise<ActionResult> {
  const user = await requireAuth();
  if (!user) return { success: false, message: "Authentication required." };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  const validatedFields = productFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const productData = validatedFields.data;

  try {
    const newProduct = await prisma.$transaction(async (tx) => {
      const [category, brand] = await Promise.all([
        tx.category.findUnique({ where: { id: productData.categoryId } }),
        tx.brand.findUnique({ where: { id: productData.brandId } }),
      ]);

      if (!category) throw new Error("Selected category does not exist.");
      if (!brand) throw new Error("Selected brand does not exist.");

      const createdProduct = await tx.product.create({
        data: {
          ...productData,
          createdById: user.id,
          specifications: productData.specifications || Prisma.JsonNull,
        },
      });

      await Promise.all([
        tx.category.update({
          where: { id: productData.categoryId },
          data: { productCount: { increment: 1 } },
        }),
        tx.brand.update({
          where: { id: productData.brandId },
          data: { productCount: { increment: 1 } },
        }),
      ]);
      return createdProduct;
    });

    revalidateTag(cacheTags.productsCollection());

    revalidateTag(cacheTags.products_by_category(newProduct.categoryId));
    revalidateTag(cacheTags.by_brand(newProduct.brandId));
    revalidateTag(cacheTags.new_arrivals());

    if (newProduct.featured) {
      revalidateTag(cacheTags.featured_products());
    }
    revalidatePath("/admin/products");
    return {
      success: true,
      message: `Product "${newProduct.name}" created successfully!`,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        errors: { slug: ["Slug must be unique."] },
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    console.error("[CREATE PRODUCT] Transaction failed:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Failed to create product.",
    };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<ActionResult> {
  const user = await requireAuth();
  if (!user) return { success: false, message: "Authentication required." };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  const validatedFields = productFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const productData = validatedFields.data;

  try {
    const oldProductState = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true, brandId: true, featured: true },
    });

    if (!oldProductState) {
      throw new Error("Product not found.");
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const productForAuth = await tx.product.findUnique({
        where: { id },
        select: { createdById: true },
      });
      if (!productForAuth) throw new Error("Product not found.");

      //   if (productForAuth.createdById !== user.id && user.role !== "ADMIN") {
      //     throw new Error("You are not authorized to edit this product.");
      //   }

      const product = await tx.product.update({
        where: { id },
        data: {
          ...productData,
          specifications: productData.specifications || Prisma.JsonNull,
        },
      });

      if (oldProductState.categoryId !== productData.categoryId) {
        await Promise.all([
          tx.category.update({
            where: { id: oldProductState.categoryId },
            data: { productCount: { decrement: 1 } },
          }),
          tx.category.update({
            where: { id: productData.categoryId },
            data: { productCount: { increment: 1 } },
          }),
        ]);
      }

      if (oldProductState.brandId !== productData.brandId) {
        await Promise.all([
          tx.brand.update({
            where: { id: oldProductState.brandId },
            data: { productCount: { decrement: 1 } },
          }),
          tx.brand.update({
            where: { id: productData.brandId },
            data: { productCount: { increment: 1 } },
          }),
        ]);
      }
      return product;
    });

    revalidateTag(cacheTags.product(updatedProduct.id));
    revalidateTag(cacheTags.productsCollection());
    revalidateTag(cacheTags.new_arrivals());

    if (oldProductState.featured !== updatedProduct.featured) {
      revalidateTag(cacheTags.featured_products());
    }

    revalidateTag(cacheTags.products_by_category(updatedProduct.categoryId));
    if (oldProductState.categoryId !== updatedProduct.categoryId) {
      revalidateTag(cacheTags.products_by_category(oldProductState.categoryId));
    }

    revalidateTag(cacheTags.by_brand(updatedProduct.brandId));
    if (oldProductState.brandId !== updatedProduct.brandId) {
      revalidateTag(cacheTags.by_brand(oldProductState.brandId));
    }
    revalidatePath("/admin/products");
    return {
      success: true,
      message: `Product "${updatedProduct.name}" updated successfully!`,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        errors: { slug: ["Slug must be unique."] },
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    console.error(
      `[UPDATE PRODUCT] Transaction failed for product ${id}:`,
      error
    );
    return {
      success: false,
      message: "An unexpected error occurred. Failed to update product.",
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  if (!user) return { success: false, message: "Authentication required." };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  try {
    const productToDelete = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: {
          categoryId: true,
          brandId: true,
          createdById: true,
          name: true,
          featured: true,
        },
      });

      if (!product) throw new Error("Product not found.");

      if (product.createdById !== user.id && user.role !== "ADMIN") {
        throw new Error("You are not authorized to delete this product.");
      }

      await Promise.all([
        tx.category.update({
          where: { id: product.categoryId },
          data: { productCount: { decrement: 1 } },
        }),
        tx.brand.update({
          where: { id: product.brandId },
          data: { productCount: { decrement: 1 } },
        }),
      ]);

      await tx.product.delete({ where: { id } });
      return product;
    });

    revalidateTag(cacheTags.productsCollection());

    revalidateTag(cacheTags.product(id));
    revalidateTag(cacheTags.products_by_category(productToDelete.categoryId));
    revalidateTag(cacheTags.by_brand(productToDelete.brandId));
    revalidateTag(cacheTags.new_arrivals());

    if (productToDelete.featured) {
      revalidateTag(cacheTags.featured_products());
    }

    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Product "${productToDelete.name}" deleted successfully.`,
    };
  } catch (error) {
    console.error(
      `[DELETE PRODUCT] Transaction failed for product ${id}:`,
      error
    );
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return {
      success: false,
      message: "An unexpected error occurred. Failed to delete product.",
    };
  }
}
