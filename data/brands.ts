"use server";

import { Brand } from "@prisma/client";
import prisma from "@/lib/prisma";
import { cacheTags } from "@/lib/cache-keys";

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
      cacheStrategy: {
        ttl: 60 * 60 * 24 * 7,
        swr: 60 * 60 * 24 * 2,
        tags: [cacheTags.brands()],
      },
    });
    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
      cacheStrategy: {
        ttl: 60 * 60 * 24 * 7,
        swr: 60 * 60 * 24 * 2,
        tags: [cacheTags.brand(id)],
      },
    });

    return brand;
  } catch (error) {
    console.error(`Error fetching brand with id ${id}:`, error);
    return null;
  }
}
