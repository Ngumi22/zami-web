"use server";

import { Brand, CategorySpecificationType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { cacheKeys, cacheTags } from "@/lib/cache-keys";
import { unstable_cache as cache } from "next/cache";

export type BrandWithProductCount = Brand & {
  productCount: number;
};

export interface CategorySpecification {
  key: string;
  name: string;
  type: "checkbox" | "range";
  values?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

export type OutputCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  specifications: CategorySpecification[];
  maxPrice: number;
};

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^./, (chr) => chr.toLowerCase());
}

export const getAllCategoriesWithSpecifications = cache(
  async (): Promise<OutputCategory[]> => {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          specifications: {
            select: {
              name: true,
              type: true,
              options: true,
              unit: true,
            },
          },
          children: {
            select: {
              id: true,
              products: {
                select: { price: true },
              },
            },
          },
          products: {
            select: { price: true },
          },
        },
      });

      return categories.map((category) => {
        const specs = category.specifications
          .map((spec) => {
            const key = toCamelCase(spec.name);

            if (spec.type === CategorySpecificationType.NUMBER) {
              const numbers = (spec.options || [])
                .map(Number)
                .filter((n) => !isNaN(n));

              if (numbers.length < 2) return null;
              return {
                key,
                name: spec.name,
                type: "range",
                min: Math.min(...numbers),
                max: Math.max(...numbers),
                unit: spec.unit || "",
              };
            }

            let values = spec.options;
            if (
              spec.type === CategorySpecificationType.BOOLEAN &&
              values.length === 0
            ) {
              values = ["Yes", "No"];
            }

            return values.length > 0
              ? { key, name: spec.name, type: "checkbox", values }
              : null;
          })
          .filter(Boolean) as CategorySpecification[];

        const allPrices = [
          ...category.products.map((p) => p.price),
          ...category.children.flatMap((child) =>
            child.products.map((p) => p.price)
          ),
        ];
        const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          specifications: specs.length ? specs : [],
          maxPrice,
        };
      });
    } catch (error) {
      console.error("[getAllCategoriesWithSpecifications]", error);
      throw error;
    }
  },
  cacheKeys.allCategoriesWithSpecifications(),
  {
    tags: [cacheTags.categories()],
    revalidate: 60 * 60 * 24,
  }
);

export const getCategoryMaxPrice = cache(
  async (categorySlug: string): Promise<number> => {
    try {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: {
          products: { select: { price: true } },
          children: {
            select: {
              products: { select: { price: true } },
            },
          },
        },
      });

      if (!category) {
        return 0;
      }

      const allPrices = [
        ...category.products.map((p) => p.price),
        ...category.children.flatMap((child) =>
          child.products.map((p) => p.price)
        ),
      ];

      return allPrices.length ? Math.max(...allPrices) : 0;
    } catch (error) {
      console.error("Error in getCategoryMaxPrice:", error);
      return 0;
    }
  },
  ["category-max-price"],
  {
    tags: [cacheTags.categories(), cacheTags.products()],
    revalidate: 60 * 60 * 24, // 24 hours
  }
);

export const getAllBrands = cache(
  async (): Promise<BrandWithProductCount[]> => {
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
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        description: brand.description,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
        isActive: brand.isActive,
        productCount: brand._count.products,
      }));
    } catch (error) {
      console.error("Error in getAllBrands:", error);
      return [];
    }
  },
  cacheKeys.allBrands(),
  {
    tags: [cacheTags.brands()],
    revalidate: 60 * 60 * 24, // 24 hours
  }
);
