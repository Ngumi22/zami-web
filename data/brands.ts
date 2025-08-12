// lib/data/brand.ts

"use server";

import { unstable_cache as cache } from "next/cache";
import { Brand } from "@prisma/client";
import prisma from "@/lib/prisma";
import { cacheKeys, cacheTags } from "@/lib/cache-keys";

export const getAllBrands = cache(
  async (): Promise<Brand[]> => {
    try {
      const brands = await prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          productCount: true,
        },
        orderBy: { name: "asc" },
      });

      return brands;
    } catch (error) {
      console.error("Error in getAllBrands:", error);
      return [];
    }
  },
  cacheKeys.allBrands(),
  {
    tags: [cacheTags.brandsCollection()],
    revalidate: 60 * 60 * 24,
  }
);

export const getBrandById = async (id: string) =>
  cache(
    async (): Promise<Brand | null> => {
      try {
        const brand = await prisma.brand.findUnique({
          where: { id },
        });
        return brand;
      } catch (error) {
        console.error(`Error fetching brand with id ${id}:`, error);
        return null;
      }
    },
    cacheKeys.brand(id),
    {
      tags: [cacheTags.brand(id)],
    }
  )();
