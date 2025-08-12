"use server";

import prisma from "@/lib/prisma";
import { Product, Prisma } from "@prisma/client";
import { mapSpecifications } from "@/lib/utils";
import { cacheTags } from "@/lib/cache-keys";

/**
 * @description A unified function to fetch a list of products with flexible options.
 * @param {object} options - The query options.
 * @param {Prisma.ProductWhereInput} [options.where] - Prisma 'where' clause.
 * @param {Prisma.ProductOrderByWithRelationInput} [options.orderBy] - Prisma 'orderBy' clause.
 * @param {number} [options.take] - Number of records to take.
 * @param {object} [options.include] - Options to include related data.
 * @param {boolean} [options.include.reviews=false] - Whether to fetch and attach reviews.
 * @param {object} [options.cache] - Caching options for Prisma Accelerate.
 * @returns {Promise<any[]>} A promise that resolves to an array of products.
 */
export async function getProducts(options: {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
  take?: number;
  include?: {
    reviews?: boolean;
  };
  cache?: {
    tags: string[];
    ttl?: number;
  };
}) {
  const { where, orderBy, take, include = {}, cache: cacheOptions } = options;

  // 1. Fetch the core product data
  const products = await prisma.product.findMany({
    where,
    orderBy,
    take,
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    ...(cacheOptions && {
      cacheStrategy: {
        ttl: cacheOptions.ttl || 60,
        tags: cacheOptions.tags,
      },
    }),
  });

  if (!products.length) return [];

  // 2. Conditionally fetch and attach reviews
  if (include.reviews) {
    const productIds = products.map((p) => p.id);
    const reviews = await prisma.review.findMany({
      where: { productId: { in: productIds } },
      include: { customer: true },
      cacheStrategy: { ttl: 60, tags: [cacheTags.reviewsBatch(productIds)] },
    });

    const reviewsByProductId = reviews.reduce<Record<string, typeof reviews>>(
      (acc, review) => {
        (acc[review.productId] = acc[review.productId] || []).push(review);
        return acc;
      },
      {}
    );

    // Map everything together
    return products.map((product) => ({
      ...product,
      reviews: reviewsByProductId[product.id] || [],
      specifications: mapSpecifications(product),
    }));
  }

  // 3. Return products with mapped specifications but without reviews
  return products.map((product) => ({
    ...product,
    specifications: mapSpecifications(product),
  }));
}

// --- Refactored List Functions ---

export const getFeaturedProducts = async (limit = 6) =>
  getProducts({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    cache: { tags: [cacheTags.featured_products()], ttl: 3600 },
  });

export const bestSelling = async (limit = 8) =>
  getProducts({
    orderBy: { sales: "desc" },
    take: limit,
    cache: { tags: [cacheTags.best_selling()], ttl: 3600 },
  });

export const newArrivals = async (limit = 8) =>
  getProducts({
    orderBy: { createdAt: "desc" },
    take: limit,
    cache: { tags: [cacheTags.new_arrivals()], ttl: 3600 },
  });

export const getProductsByCategory = async (
  categoryId: string,
  limit?: number
) =>
  getProducts({
    where: { categoryId },
    take: limit,
    cache: { tags: [cacheTags.products_by_category(categoryId)], ttl: 3600 },
  });

export const getTopRatedProducts = async (limit = 10) =>
  getProducts({
    where: { averageRating: { gt: 0 } }, // Only include products that have ratings
    orderBy: { averageRating: "desc" },
    take: limit,
    include: { reviews: true },
    cache: { tags: ["top_rated_products"], ttl: 86400 },
  });

export const discountedProducts = async (limit = 10) =>
  getProducts({
    where: { originalPrice: { gt: 0 } }, // Simplified logic for discounts
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { reviews: true },
    cache: { tags: ["discounted_products"], ttl: 86400 },
  });

/**
 * @description A unified function to fetch a single product.
 * @param {object} options - The query options.
 * @param {Prisma.ProductWhereUniqueInput} options.where - Prisma 'where' clause for a unique field.
 * @param {boolean} [options.includeReviews=true] - Whether to fetch and attach reviews.
 * @param {object} [options.cache] - Caching options.
 * @returns {Promise<any|null>} A promise that resolves to a single product or null.
 */
export async function getProduct(options: {
  where: Prisma.ProductWhereUniqueInput;
  includeReviews?: boolean;
  cache: {
    tags: string[];
    ttl?: number;
  };
}) {
  const { where, includeReviews = true, cache: cacheOptions } = options;

  const product = await prisma.product.findUnique({
    where,
    include: { brand: true, category: true },
    cacheStrategy: {
      ttl: cacheOptions.ttl || 86400, // Default to 24 hours
      tags: cacheOptions.tags,
    },
  });

  if (!product) return null;

  let reviews: any[] = [];
  if (includeReviews) {
    reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: { customer: true },
      cacheStrategy: { ttl: 3600, tags: [cacheTags.reviews(product.id)] },
    });
  }

  return {
    ...product,
    reviews,
    specifications: mapSpecifications(product),
  };
}

// --- Refactored Single-Item Functions ---
export const getProductById = async (productId: string) =>
  getProduct({
    where: { id: productId },
    cache: { tags: [cacheTags.product(productId)] },
  });

export const getProductBySlug = async (slug: string) =>
  getProduct({
    where: { slug },
    cache: { tags: [cacheTags.productBySlug(slug)] },
  });

export async function getFrequentlyBoughtTogetherProducts(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      category: true,
      brand: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
    },
  });

  if (!product) return [];

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          productId: product.id,
        },
      },
    },
    select: {
      items: true,
    },
  });

  const productFrequencyMap: Record<string, number> = {};

  for (const order of orders) {
    for (const item of order.items) {
      if (item.productId !== product.id) {
        productFrequencyMap[item.productId] =
          (productFrequencyMap[item.productId] || 0) + 1;
      }
    }
  }

  const sortedIds = Object.entries(productFrequencyMap)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 5);

  if (sortedIds.length === 0) return [];

  const suggestedProducts = await prisma.product.findMany({
    where: { id: { in: sortedIds } },
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
  });

  return suggestedProducts;
}

export async function getRelatedProducts(slug: string, limit: number = 8) {
  const currentProduct = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, categoryId: true, brandId: true },
  });

  if (!currentProduct) return [];

  const { categoryId, brandId } = currentProduct;

  const related = await prisma.product.findMany({
    where: {
      slug: { not: slug },
      OR: [{ categoryId }, ...(brandId ? [{ brandId }] : [])],
    },
    include: {
      brand: true,
      category: true,
    },
    take: limit,
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
    },
  });

  return related; // No manual mapping/calculation needed
}

export async function getLowStockProducts(threshold = 10): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { stock: { lte: threshold } },
      orderBy: { stock: "asc" },
      cacheStrategy: {
        ttl: 60 * 60 * 24 * 7,
        swr: 60 * 60 * 24 * 2,
      },
    });
  } catch (error) {
    console.error("Failed to fetch low stock products:", error);
    return [];
  }
}

type TopProductRevenue = {
  _id: string;
  totalRevenue: number;
  totalUnitsSold: number;
};

export async function getTopProductsWithRevenue(): Promise<
  (Product & { totalRevenue: number; totalUnitsSold: number })[]
> {
  const rawResult = await prisma.$runCommandRaw({
    aggregate: "Order",
    pipeline: [
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalRevenue: { $sum: "$items.total" },
          totalUnitsSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ],
    cursor: {},
  });

  const result = rawResult as {
    cursor?: { firstBatch?: TopProductRevenue[] };
  };

  const batch = result?.cursor?.firstBatch ?? [];

  const productIds = batch.map((item) => item._id);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // Merge product data with revenue
  return batch
    .map((entry) => {
      const product = products.find((p: { id: string }) => p.id === entry._id);
      if (!product) return null;

      return {
        ...product,
        totalRevenue: entry.totalRevenue,
        totalUnitsSold: entry.totalUnitsSold,
      };
    })
    .filter(
      (p): p is Product & { totalRevenue: number; totalUnitsSold: number } =>
        !!p
    );
}
