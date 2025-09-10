"use server";

import { revalidatePath } from "next/cache";
import { CollectionType } from "@prisma/client";
import { collectionCreateSchema } from "@/lib/validations/collection";
import prisma from "./prisma";

export type ActionResult = {
  success: boolean;
  data?: any;
  errors?: {
    [key: string]: string[];
  };
  message?: string;
};

function parseFormData(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  return {
    ...rawData,
    isActive: rawData.isActive === "on" || rawData.isActive === "true",
    productIds: rawData.productIds
      ? JSON.parse(rawData.productIds as string)
      : [],
  };
}

export async function createCollection(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = parseFormData(formData);

    const parsedData = collectionCreateSchema.safeParse(rawData);

    if (!parsedData.success) {
      return {
        success: false,
        errors: parsedData.error.flatten().fieldErrors,
        message: "Validation failed",
      };
    }

    const validatedData = parsedData.data;

    // Check if slug is already taken
    const existingCollection = await prisma.collection.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCollection) {
      return {
        success: false,
        errors: {
          slug: ["A collection with this slug already exists"],
        },
        message: "Slug already taken",
      };
    }

    // Create the collection
    const collection = await prisma.collection.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        type: validatedData.type as CollectionType,
        isActive: validatedData.isActive,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        products: {
          create: validatedData.productIds.map((productId, index) => ({
            productId,
            order: index,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");

    return {
      success: true,
      data: collection,
      message: "Collection created successfully",
    };
  } catch (error: any) {
    console.error("Error creating collection:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        errors: {
          slug: ["A collection with this slug already exists"],
        },
        message: "Slug already taken",
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateCollection(
  id: string,
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = parseFormData(formData);

    const parsedData = collectionCreateSchema.safeParse(rawData);

    if (!parsedData.success) {
      return {
        success: false,
        errors: parsedData.error.flatten().fieldErrors,
        message: "Validation failed",
      };
    }

    const validatedData = parsedData.data;

    const existingCollection = await prisma.collection.findFirst({
      where: {
        slug: validatedData.slug,
        NOT: { id },
      },
    });

    if (existingCollection) {
      return {
        success: false,
        errors: {
          slug: ["A collection with this slug already exists"],
        },
        message: "Slug already taken",
      };
    }

    await prisma.productsOnCollections.deleteMany({
      where: { collectionId: id },
    });

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        type: validatedData.type as CollectionType,
        isActive: validatedData.isActive,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        products: {
          create: validatedData.productIds.map((productId, index) => ({
            productId,
            order: index,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");

    return {
      success: true,
      data: collection,
      message: "Collection updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating collection:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        errors: {
          slug: ["A collection with this slug already exists"],
        },
        message: "Slug already taken",
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  try {
    await prisma.productsOnCollections.deleteMany({
      where: { collectionId: id },
    });

    await prisma.collection.delete({
      where: { id },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");

    return {
      success: true,
      message: "Collection deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return {
      success: false,
      message: "Failed to delete collection",
    };
  }
}
