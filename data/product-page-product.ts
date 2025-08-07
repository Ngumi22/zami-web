"use server";

import prisma from "@/lib/prisma";
import { cacheTags } from "@/lib/cache-keys";
import { mapSpecifications } from "@/lib/utils";
import { revalidateTag } from "next/cache";

export type ProductWithDetails = {
  id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  originalPrice?: number;
  featured?: boolean;
  variants?: any;
  tags?: string[];
  reviewCount?: number;
  thumbnailImages?: string[];
  stock?: number;
  price: number;
  image: string;
  categoryId: string;
  categoryName: string;
  mainCategoryId: string | null;
  mainCategoryName: string | null;
  brandId: string;
  brandName: string;
  specifications: Record<string, string | number>;
  rating: number;
  popularity: number;
  createdAt: string | any;
  updatedAt?: any;
  sales?: number;
};

export interface GetProductsParams {
  category?: string;
  subcategories?: string[];
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: "rating" | "low" | "high" | "newest" | "popularity";
  page?: number;
  pageSize?: number;
  specifications?: Record<string, string[]>;
  limit?: number;
}

export interface ProductsResponse {
  products: ProductWithDetails[];
  totalCount: number;
  maxPrice: number;
  hasMore: boolean;
}

const sortMap = {
  rating: { field: "averageRating", direction: "desc" },
  low: { field: "price", direction: "asc" },
  high: { field: "price", direction: "desc" },
  newest: { field: "createdAt", direction: "desc" },
  popularity: { field: "sales", direction: "desc" },
} as const;

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days

async function getProductsImpl(
  params: GetProductsParams
): Promise<ProductsResponse> {
  const {
    category,
    subcategories = [],
    brands = [],
    priceMin,
    priceMax,
    sort = "rating",
    page = 1,
    pageSize = 12,
    specifications = {},
  } = params;

  const { field: sortField, direction: sortDir } =
    sortMap[sort] ?? sortMap.rating;

  let mainCategoryId: string | undefined;
  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
      select: { id: true },
    });
    if (!cat)
      return { products: [], totalCount: 0, maxPrice: 0, hasMore: false };
    mainCategoryId = cat.id;
  }

  const resolvedSubcategoryIds =
    subcategories.length > 0
      ? (
          await prisma.category.findMany({
            where: { slug: { in: subcategories } },
            select: { id: true },
          })
        ).map((c) => c.id)
      : [];

  const resolvedBrandIds =
    brands.length > 0
      ? (
          await prisma.brand.findMany({
            where: { slug: { in: brands } },
            select: { id: true },
          })
        ).map((b) => b.id)
      : [];

  const priceFilter: Record<string, number> = {};
  if (priceMin != null) priceFilter.gte = priceMin;
  if (priceMax != null && Number.isFinite(priceMax)) priceFilter.lte = priceMax;

  const where: any = {
    ...(Object.keys(priceFilter).length && { price: priceFilter }),
    ...(resolvedBrandIds.length && { brandId: { in: resolvedBrandIds } }),
    ...(resolvedSubcategoryIds.length && {
      categoryId: { in: resolvedSubcategoryIds },
    }),
    ...(mainCategoryId && { category: { parentId: mainCategoryId } }),
  };

  const allIds = await prisma.product.findMany({
    where,
    select: { id: true },
    cacheStrategy: { ttl: CACHE_TTL, swr: CACHE_TTL / 2 },
  });

  const allMatchingIds = allIds.map((p) => p.id);
  if (allMatchingIds.length === 0)
    return { products: [], totalCount: 0, maxPrice: 0, hasMore: false };

  const specFiltered = await prisma.product.findMany({
    where: { id: { in: allMatchingIds } },
    include: {
      brand: { select: { id: true, name: true } },
      category: {
        select: {
          id: true,
          name: true,
          parentId: true,
          parent: { select: { name: true } },
        },
      },
      reviews: { select: { rating: true } },
    },
    orderBy: { [sortField]: sortDir },
    cacheStrategy: { ttl: CACHE_TTL, swr: CACHE_TTL / 2 },
  });

  const fullyFiltered = specFiltered.filter((prod) => {
    const specs = mapSpecifications(prod);
    return Object.entries(specifications).every(([key, vals]) => {
      if (!vals.length) return true;
      return vals.includes(String(specs[key]));
    });
  });

  const totalCount = fullyFiltered.length;
  const paginated = fullyFiltered.slice((page - 1) * pageSize, page * pageSize);

  const formatted: ProductWithDetails[] = paginated.map((p) => {
    const reviewCount = p.reviews.length;
    const avgRating = reviewCount
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    const popularity = Math.min(
      100,
      Math.round(avgRating * 15 + reviewCount * 0.5 + (p.sales || 0) * 0.2)
    );

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.mainImage,
      categoryId: p.category.id,
      categoryName: p.category.name,
      mainCategoryId: p.category.parentId,
      mainCategoryName: p.category.parent?.name ?? null,
      brandId: p.brand.id,
      brandName: p.brand.name,
      specifications: p.specifications as Record<string, string | number>,
      rating: parseFloat(avgRating.toFixed(1)),
      popularity,
      createdAt: p.createdAt.toISOString().split("T")[0],
    };
  });

  const fastFiltered = await prisma.product.findMany({
    where,
    select: { price: true },
    cacheStrategy: { ttl: CACHE_TTL, swr: CACHE_TTL / 2 },
  });

  const maxPrice =
    fastFiltered.length > 0 ? Math.max(...fastFiltered.map((p) => p.price)) : 0;

  return {
    products: formatted,
    totalCount,
    maxPrice,
    hasMore: page * pageSize < totalCount,
  };
}

export async function getProducts(
  params: GetProductsParams
): Promise<ProductsResponse> {
  return getProductsImpl(params);
}

export async function invalidateProductsCache() {
  revalidateTag(cacheTags.products());
}

export async function invalidateProductCache(productId: string) {
  revalidateTag(cacheTags.product(productId));
}
