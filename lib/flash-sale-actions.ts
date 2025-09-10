"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import {
  Collection,
  CollectionType,
  Product,
  ProductsOnCollections,
} from "@prisma/client";
import { FlashSaleUpdateData, AdminCollection } from "./types";
import prisma from "./prisma";

export interface FlashSaleCreateData {
  name: string;
  productIds: string[];
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface CachedCollection extends Collection {
  products: (ProductsOnCollections & {
    product: Product;
  })[];
}

const CACHE_TAG = "collections";

export async function revalidateCollections() {
  revalidateTag(CACHE_TAG);
}

export async function revalidateCollection(id: string) {
  revalidateTag(CACHE_TAG);
}

export async function createFlashSaleCollection(
  data: FlashSaleCreateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { name, productIds, startDate, endDate, description } = data;

    // Generate a slug from the name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: description || null,
        type: CollectionType.FLASH_SALE,
        startDate: startDate || null,
        endDate: endDate || null,
        products: {
          create: productIds.map((productId, index) => ({
            productId,
            order: index,
          })),
        },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating flash sale collection:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: "A collection with this name already exists",
      };
    }

    return { success: false, error: "Failed to create collection" };
  }
}

export async function addProductsToFlashSale(
  collectionId: string,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const maxOrderResult = await prisma.productsOnCollections.aggregate({
      where: { collectionId },
      _max: { order: true },
    });

    const startOrder = (maxOrderResult._max.order ?? -1) + 1;

    for (let i = 0; i < productIds.length; i++) {
      try {
        await prisma.productsOnCollections.create({
          data: {
            productId: productIds[i],
            collectionId,
            order: startOrder + i,
          },
        });
      } catch (error: any) {
        throw error;
      }
    }

    revalidatePath("/");
    revalidateCollections();

    return { success: true };
  } catch (error) {
    console.error("Error adding products to flash sale:", error);
    return { success: false, error: "Failed to add products" };
  }
}

export async function removeProductsFromFlashSale(
  collectionId: string,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.productsOnCollections.deleteMany({
      where: {
        collectionId,
        productId: { in: productIds },
      },
    });

    await reorderCollectionProducts(collectionId);

    revalidatePath("/");
    revalidateCollections();

    return { success: true };
  } catch (error) {
    console.error("Error removing products from flash sale:", error);
    return { success: false, error: "Failed to remove products" };
  }
}

async function reorderCollectionProducts(collectionId: string): Promise<void> {
  const products = await prisma.productsOnCollections.findMany({
    where: { collectionId },
    orderBy: { order: "asc" },
  });

  const updatePromises = products.map((product, index) =>
    prisma.productsOnCollections.update({
      where: { id: product.id },
      data: { order: index },
    })
  );

  await Promise.all(updatePromises);
}
export async function updateCollectionProductOrder(
  collectionId: string,
  productOrders: { productId: string; order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePromises = productOrders.map(({ productId, order }) =>
      prisma.productsOnCollections.updateMany({
        where: {
          collectionId,
          productId,
        },
        data: { order },
      })
    );

    await Promise.all(updatePromises);
    revalidatePath("/");
    revalidateCollections();

    return { success: true };
  } catch (error) {
    console.error("Error updating product order:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function updateFlashSaleCollection(
  collectionId: string,
  data: FlashSaleUpdateData
): Promise<{ success: boolean; collection?: any; error?: string }> {
  try {
    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data,
    });

    revalidatePath("/");
    revalidateCollections();

    revalidateCollection(collectionId);
    return { success: true, collection };
  } catch (error: any) {
    console.error("Error updating collection:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: "A collection with this slug already exists",
      };
    }

    return { success: false, error: "Failed to update collection" };
  }
}

export async function deleteFlashSaleCollection(
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.productsOnCollections.deleteMany({
      where: { collectionId },
    });

    await prisma.collection.delete({
      where: { id: collectionId },
    });

    revalidatePath("/");
    revalidateCollections();

    return { success: true };
  } catch (error) {
    console.error("Error deleting flash sale collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}
