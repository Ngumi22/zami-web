"use server";
import prisma from "@/lib/prisma";
import { Product } from "@prisma/client";
import { mapSpecifications } from "@/lib/utils";
import { cacheTags } from "@/lib/cache-keys";

export async function getProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      brand: true,
      category: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.product(productId)],
    },
  });

  if (!product) return null;

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    include: {
      customer: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.reviews(product.id)],
    },
  });

  return {
    ...product,
    reviews,
    specifications: mapSpecifications(product),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.productBySlug(slug)],
    },
  });

  if (!product) return null;

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    include: { customer: true },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.reviews(product.id)],
    },
  });

  const mapped = mapSpecifications(product);

  return {
    ...product,
    reviews,
    mappedSpecifications: mapped,
  };
}

export async function getAllProducts(limit?: number) {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    take: limit,
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.products()],
    },
  });

  if (!products.length) return [];

  const productIds = products.map((p: Product) => p.id);

  const reviews = await prisma.review.findMany({
    where: {
      productId: { in: productIds },
    },
    include: {
      customer: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.reviewsBatch(productIds)],
    },
  });

  const reviewsByProductId = reviews.reduce((acc: any, review: any) => {
    (acc[review.productId] ||= []).push(review);
    return acc;
  }, {} as Record<string, typeof reviews>);

  return products.map((product: Product) => ({
    ...product,
    reviews: reviewsByProductId[product.id] || [],
    specifications: mapSpecifications(product),
  }));
}

export async function getFeaturedProducts(limit: number = 6) {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: limit,
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24,
      swr: 60 * 60 * 6,
      tags: [cacheTags.featuredProducts()],
    },
  });

  return featured.map((product: Product) => ({
    ...product,
    specifications: mapSpecifications(product),
  }));
}

export async function newArrivals(limit: number = 8) {
  const latest = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 60 * 60 * 12,
      swr: 60 * 60 * 2,
      tags: [cacheTags.newArrivals()],
    },
  });

  return latest.map((product: Product) => ({
    ...product,
    specifications: mapSpecifications(product),
  }));
}

export async function getProductsByCategory(
  categoryId: string,
  limit?: number
) {
  const categorized = await prisma.product.findMany({
    where: { categoryId },
    take: limit,
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 60 * 60 * 12,
      swr: 60 * 60 * 3,
      tags: [cacheTags.productsByCategory(categoryId)],
    },
  });

  return categorized.map((product: Product) => ({
    ...product,
    specifications: mapSpecifications(product),
  }));
}

export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { brandId },
    include: {
      brand: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.byBrand(brandId)],
    },
  });

  if (!products.length) return [];

  const productIds = products.map((p: Product) => p.id);

  const reviews = await prisma.review.findMany({
    where: {
      productId: { in: productIds },
    },
    include: {
      customer: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7, // 7 days
      swr: 60 * 60 * 24 * 2, // 2 days stale-while-revalidate
    },
  });

  const reviewsByProductId = reviews.reduce((acc: any, review: any) => {
    (acc[review.productId] ||= []).push(review);
    return acc;
  }, {} as Record<string, typeof reviews>);

  return products.map((product: Product) => ({
    ...product,
    reviews: reviewsByProductId[product.id] || [],
    specifications: mapSpecifications(product),
  }));
}

export async function getTopProduct(id: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { id },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [`product_${id}`],
    },
  });
}

export async function getTopProducts(): Promise<Product[]> {
  return await prisma.product.findMany({
    orderBy: { sales: "desc" },
    take: 10,
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
    },
  });
}

export async function getTopRatedProducts(limit?: number) {
  const products = await prisma.product.findMany({
    orderBy: {
      averageRating: "desc",
    },
    take: limit,
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
    },
  });

  if (!products.length) return [];

  const productIds = products.map((p: Product) => p.id);

  const reviews = await prisma.review.findMany({
    where: {
      productId: { in: productIds },
    },
    include: {
      customer: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7, // 7 days
      swr: 60 * 60 * 24 * 2, // 2 days stale-while-revalidate
    },
  });

  const reviewsByProductId = reviews.reduce((acc: any, review: any) => {
    (acc[review.productId] ||= []).push(review);
    return acc;
  }, {} as Record<string, typeof reviews>);

  return products.map((product: Product) => ({
    ...product,
    reviews: reviewsByProductId[product.id] || [],
    specifications: mapSpecifications(product),
  }));
}

export async function getFrequentlyBoughtTogetherProducts(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
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
          productId,
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
      if (item.productId !== productId) {
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

export async function getRelatedProducts(productId: string, limit?: number) {
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      categoryId: true,
      brandId: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
    },
  });

  if (!currentProduct) return [];

  const { categoryId, brandId } = currentProduct;

  const related = await prisma.product.findMany({
    where: {
      id: { not: productId },
      OR: [{ categoryId }, ...(brandId ? [{ brandId }] : [])],
    },
    include: {
      brand: true,
      category: true,
      reviews: true,
    },
    take: limit,
  });

  return related.map((product: any) => {
    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : product.reviews.reduce(
            (sum: any, r: { rating: any }) => sum + r.rating,
            0
          ) / reviewCount;

    return {
      ...product,
      reviewCount,
      averageRating,
    };
  });
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

export async function getProductsStats() {
  try {
    const totalProducts = await prisma.product.count();

    const featuredProducts = await prisma.product.count({
      where: { featured: true },
    });

    const outOfStockProducts = await prisma.product.count({
      where: { stock: 0 },
    });

    const lowStockProducts = await prisma.product.count({
      where: { stock: { gt: 0, lte: 10 } },
    });

    const products = await prisma.product.findMany({
      select: { price: true, stock: true, variants: true },
    });

    const totalValue = products.reduce(
      (sum: number, p: { price: any; stock: any }) =>
        sum + (p.price ?? 0) * (p.stock ?? 0),
      0
    );

    const productsWithVariants = products.filter(
      (p: { variants: string | any[] }) => p.variants && p.variants.length > 0
    ).length;

    const totalVariants = products.reduce(
      (sum: any, p: { variants: string | any[] }) =>
        sum + (p.variants?.length || 0),
      0
    );

    return {
      totalProducts,
      featuredProducts,
      outOfStockProducts,
      lowStockProducts,
      totalValue,
      productsWithVariants,
      totalVariants,
    };
  } catch (error) {
    return {
      totalProducts: 0,
      featuredProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
      totalValue: 0,
      productsWithVariants: 0,
      totalVariants: 0,
    };
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

export async function discountedProducts(limit?: number) {
  const discounted = await prisma.product.findMany({
    where: {
      originalPrice: {
        not: null,
        gt: prisma.product.fields.price,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      brand: true,
      category: {
        select: {
          name: true,
          specifications: true,
        },
      },
    },
    take: limit,
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
    },
  });

  if (!discounted.length) return [];

  const filtered = discounted.filter(
    (_: any, index: number) => index % 2 === 0
  );

  const productIds = filtered.map((p: any) => p.id);
  const reviews = await prisma.review.findMany({
    where: {
      productId: { in: productIds },
    },
    include: {
      customer: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7, // 7 days
      swr: 60 * 60 * 24 * 2, // 2 days stale-while-revalidate
    },
  });

  const reviewsByProductId = reviews.reduce((acc: any, review: any) => {
    (acc[review.productId] ||= []).push(review);
    return acc;
  }, {} as Record<string, typeof reviews>);

  return filtered.map((product: Product) => ({
    ...product,
    reviews: reviewsByProductId[product.id] || [],
    specifications: mapSpecifications(product),
  }));
}
