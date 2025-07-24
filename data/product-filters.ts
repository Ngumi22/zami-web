"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface NormalizedProduct {
  id: string;
  slug: string;
  name: string;
  originalPrice: number;
  mainImage: string;
  featured: boolean;
  stock: number;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  averageRating: number;
  reviewCount: number;
  price: number;
  tags: string[];
  specifications: { [key: string]: string };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  stock?: number;
  tags?: string[];
  specifications?: { [key: string]: string };
}

export interface ProductsResponse {
  products: NormalizedProduct[];
  facets: {
    categories: { name: string; slug: string; count: number }[];
    brands: { name: string; slug: string; count: number }[];
    priceRange: { min: number; max: number };
    specifications: { name: string; values: string[] }[];
    tags: { name: string; count: number }[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Utility function to normalize product specifications
function normalizeProductSpecifications(product: {
  specifications: Prisma.JsonValue;
  category: { specifications: any[] };
}): Record<string, string> {
  const productSpecs =
    product.specifications && typeof product.specifications === "object"
      ? (product.specifications as Record<string, unknown>)
      : {};

  const categorySpecs = product.category?.specifications || [];

  const normalizedSpecs: Record<string, string> = {};

  categorySpecs.forEach((spec: { name: string; id?: string }) => {
    const specKey = spec.name || spec.id || "";
    const rawValue = productSpecs[spec.name] ?? productSpecs[spec.id || ""];

    normalizedSpecs[spec.name] =
      rawValue !== null && rawValue !== undefined
        ? String(rawValue)
        : "Not specified";
  });

  return normalizedSpecs;
}

// Utility function to generate specification facets
function extractFacetSpecifications(
  products: {
    specifications: Record<string, string>;
  }[]
): { name: string; values: string[] }[] {
  const specs: Record<string, Set<string>> = {};

  for (const product of products) {
    if (!product.specifications) continue;

    for (const [name, value] of Object.entries(product.specifications)) {
      if (!specs[name]) {
        specs[name] = new Set();
      }
      if (value && value !== "Not specified") {
        specs[name].add(value);
      }
    }
  }

  return Object.entries(specs).map(([name, values]) => ({
    name,
    values: Array.from(values).sort(),
  }));
}

export async function getProductsByFilters(
  filters: ProductFilters
): Promise<ProductsResponse> {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
    featured,
    stock,
    tags: filterTags,
    specifications: specFilters,
    page = 1,
    limit = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = { AND: [] };

  if (search) {
    (where.AND as Prisma.ProductWhereInput[]).push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { tags: { has: search } },
      ],
    });
  }

  if (category) {
    (where.AND as Prisma.ProductWhereInput[]).push({
      category: { slug: category },
    });
  }
  if (brand) {
    (where.AND as Prisma.ProductWhereInput[]).push({ brand: { slug: brand } });
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: { gte?: number; lte?: number } = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    (where.AND as Prisma.ProductWhereInput[]).push({ price: priceFilter });
  }
  if (featured !== undefined) {
    (where.AND as Prisma.ProductWhereInput[]).push({ featured });
  }
  if (stock !== undefined && stock > 0) {
    (where.AND as Prisma.ProductWhereInput[]).push({ stock: { gt: 0 } });
  }
  if (filterTags && filterTags.length > 0) {
    (where.AND as Prisma.ProductWhereInput[]).push({
      tags: { hasSome: filterTags },
    });
  }

  if (specFilters && Object.keys(specFilters).length > 0) {
    (where.AND as Prisma.ProductWhereInput[]).push({
      specifications: {
        equals: specFilters as Prisma.InputJsonValue,
      },
    });
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "rating-desc":
      orderBy = { averageRating: "desc" };
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
  }

  const skip = (page - 1) * limit;
  const cacheStrategy = { ttl: 60 };
  const facetCacheStrategy = { ttl: 3600 };

  const productsPromise = prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    cacheStrategy,
  });

  const totalCountPromise = prisma.product.count({ where, cacheStrategy });

  const categoryFacetsPromise = prisma.category.findMany({
    select: { name: true, slug: true, _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
    cacheStrategy: facetCacheStrategy,
  });

  const brandFacetsPromise = prisma.brand.findMany({
    select: { name: true, slug: true, _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
    cacheStrategy: facetCacheStrategy,
  });

  const priceRangePromise = prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
    cacheStrategy: facetCacheStrategy,
  });

  const allProductsForFacetsPromise = prisma.product.findMany({
    select: {
      tags: true,
      specifications: true,
      category: {
        select: {
          specifications: true,
        },
      },
    },
    cacheStrategy: facetCacheStrategy,
  });

  const [
    products,
    totalCount,
    categoryFacetsRaw,
    brandFacetsRaw,
    priceRangeRaw,
    allProductsForFacets,
  ] = await Promise.all([
    productsPromise,
    totalCountPromise,
    categoryFacetsPromise,
    brandFacetsPromise,
    priceRangePromise,
    allProductsForFacetsPromise,
  ]);

  const normalizedProducts: NormalizedProduct[] = products.map((p) => ({
    ...p,
    originalPrice: p.originalPrice ?? 0,
    specifications: p.specifications as { [key: string]: string },
  }));

  const totalPages = Math.ceil(totalCount / limit);

  const categories = categoryFacetsRaw.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }));

  const brands = brandFacetsRaw.map((b) => ({
    name: b.name,
    slug: b.slug,
    count: b._count.products,
  }));

  const priceRange = {
    min: priceRangeRaw._min.price ?? 0,
    max: priceRangeRaw._max.price ?? 0,
  };

  const tagCounts = new Map<string, number>();
  allProductsForFacets.forEach((product) => {
    product.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const tagsFacet = Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const mappedProductsForSpecFacets = allProductsForFacets.map((p) => ({
    specifications: normalizeProductSpecifications(p),
  }));
  const specificationsFacet = extractFacetSpecifications(
    mappedProductsForSpecFacets
  );

  return {
    products: normalizedProducts,
    facets: {
      categories,
      brands,
      priceRange,
      tags: tagsFacet,
      specifications: specificationsFacet,
    },
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
