"use server";

import prisma from "@/lib/prisma";
import { CollectionType, ProductVariant } from "@prisma/client";
import { unstable_cache as cache } from "next/cache";
import { Prisma } from "@prisma/client";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  mainImage: string;
  price: number;
  originalPrice: number | null;
  brand: string;
  stock: number;
  hasVariants: boolean;
  priceRange?: { min: number; max: number };
  category: {
    name: string;
    slug: string;
    parent: {
      name: string;
      slug: string;
    } | null;
  };
  collection: string | null;
  variants: ProductVariant[];
};

// Define a comprehensive type for all possible filter and sort options
export type ProductQueryOptions = {
  limit?: number;
  offset?: number;
  // Filters
  filters?: {
    brand?: string;
    brands?: string[];
    category?: string;
    collection?: string;
    isFeatured?: boolean;
    isDiscounted?: boolean;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  };
  // Sorting
  sortBy?: "newest" | "top-rated" | "bestsellers" | "price-asc" | "price-desc";
};

export async function getProductsForCard(
  options: ProductQueryOptions = {}
): Promise<ProductCardData[]> {
  const { limit = 12, offset = 0, filters = {}, sortBy } = options;

  return cache(
    async () => {
      try {
        const where: Prisma.ProductWhereInput = {};
        const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];

        // Apply filters
        if (filters.brand) {
          where.brand = { name: filters.brand };
        }
        if (filters.brands && filters.brands.length > 0) {
          where.brand = { name: { in: filters.brands } };
        }
        if (filters.category) {
          where.category = { slug: filters.category };
        }
        if (filters.collection) {
          where.collections = {
            some: {
              collection: {
                slug: filters.collection,
              },
            },
          };
        }
        if (filters.isFeatured) {
          where.featured = true;
        }
        if (filters.isDiscounted) {
          // Check for a non-null original price to indicate a deal
          where.originalPrice = { not: null };
        }
        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
          where.price = { gte: filters.priceMin, lte: filters.priceMax };
        }
        if (filters.search) {
          // Search on multiple fields using OR
          where.OR = [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            {
              brand: {
                name: { contains: filters.search, mode: "insensitive" },
              },
            },
          ];
        }

        // Apply sorting
        switch (sortBy) {
          case "newest":
            orderBy.push({ createdAt: "desc" });
            break;
          case "top-rated":
            orderBy.push({ averageRating: "desc" });
            break;
          case "bestsellers":
            orderBy.push({ sales: "desc" });
            break;
          case "price-asc":
            orderBy.push({ price: "asc" });
            break;
          case "price-desc":
            orderBy.push({ price: "desc" });
            break;
          default:
            // Fallback to a default order if no specific sort is requested
            orderBy.push({ createdAt: "desc" });
            break;
        }

        const productsFromDb = await prisma.product.findMany({
          take: limit,
          skip: offset,
          where,
          orderBy,
          select: {
            id: true,
            slug: true,
            name: true,
            mainImage: true,
            price: true,
            originalPrice: true,
            stock: true,
            variants: {
              select: {
                id: true,
                name: true,
                type: true,
                value: true,
                priceModifier: true,
                stock: true,
                sku: true,
              },
            },
            brand: { select: { name: true } },
            category: {
              include: {
                parent: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            collections: {
              take: 1,
              select: { collection: { select: { name: true } } },
            },
          },
        });

        return productsFromDb.map((p) => {
          const hasVariants = p.variants.length > 0;

          let price = p.price;
          let priceRange: { min: number; max: number } | undefined;

          if (hasVariants) {
            const prices = p.variants.map(
              (v) => p.price + (v.priceModifier ?? 0)
            );
            priceRange = {
              min: Math.min(...prices),
              max: Math.max(...prices),
            };
            price = priceRange.min;
          }

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            mainImage: p.mainImage,
            price,
            originalPrice: p.originalPrice,
            stock: p.stock,
            brand: p.brand.name,
            hasVariants,
            priceRange,
            category: {
              name: p.category.parent?.name || p.category.name,
              slug: p.category.parent?.slug || p.category.slug,
              parent: p.category.parent
                ? {
                    name: p.category.parent.name,
                    slug: p.category.parent.slug,
                  }
                : null,
            },
            collection: p.collections[0]?.collection.name ?? null,
            variants: p.variants,
          };
        });
      } catch (error) {
        console.error(
          "Database Error: Failed to fetch products for cards.",
          error
        );
        return [];
      }
    },
    ["products-for-card", JSON.stringify(options)], // Use a unique cache key
    {
      tags: ["products"],
      revalidate: 3600,
    }
  )();
}

// A wrapper for fetching new arrivals
export async function newArrivals(): Promise<ProductCardData[]> {
  return cache(
    async () => {
      return getProductsForCard({ sortBy: "newest", limit: 6 });
    },
    ["new-arrivals"],
    {
      tags: ["new-arrivals", "products"],
      revalidate: 60 * 60, // 1 hour
    }
  )();
}

// A wrapper for fetching top-rated products
export async function getTopRatedProducts(): Promise<ProductCardData[]> {
  return cache(
    async () => {
      return getProductsForCard({ sortBy: "top-rated", limit: 6 });
    },
    ["top-rated-products"],
    {
      tags: ["top-rated-products", "products"],
      revalidate: 60 * 60, // 1 hour
    }
  )();
}

// A wrapper for fetching discounted products (deals)
export async function discountedProducts(): Promise<ProductCardData[]> {
  return cache(
    async () => {
      return getProductsForCard({ filters: { isDiscounted: true }, limit: 6 });
    },
    ["discounted-products"],
    {
      tags: ["discounted-products", "products"],
      revalidate: 60 * 30, // 30 minutes
    }
  )();
}

// A wrapper for fetching featured products
export async function getFeaturedProducts(): Promise<ProductCardData[]> {
  return cache(
    async () => {
      return getProductsForCard({ filters: { isFeatured: true }, limit: 6 });
    },
    ["featured-products"],
    {
      tags: ["featured-products", "products"],
      revalidate: 60 * 60, // 1 hour
    }
  )();
}

export async function getAllProducts(
  limit?: number
): Promise<ProductCardData[]> {
  return cache(
    async () => {
      return getProductsForCard({ limit });
    },
    ["all-products", limit ? `limit-${limit}` : "no-limit"],
    {
      tags: ["all-products", "products"],
      revalidate: 60 * 60, // 1 hour
    }
  )();
}

// A more complex wrapper to get products for a collection page, including total count
export async function getCollectionProducts(options: {
  collection: string;
  category?: string;
  sort?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  search?: string;
  perPage: number;
  offset: number;
}) {
  return cache(
    async () => {
      const { collection, sort, perPage, offset, ...filters } = options;

      let sortBy: ProductQueryOptions["sortBy"] = "newest"; // Default sort
      if (sort === "price-asc") sortBy = "price-asc";
      if (sort === "price-desc") sortBy = "price-desc";
      if (sort === "top-rated") sortBy = "top-rated";
      if (sort === "bestsellers") sortBy = "bestsellers";

      const where: Prisma.ProductWhereInput = {
        collections: { some: { collection: { slug: collection } } },
      };

      if (filters.category) {
        where.category = {
          slug: filters.category,
        };
      }

      if (filters.brands) {
        where.brand = {
          name: { in: filters.brands },
        };
      }

      if (filters.priceMin || filters.priceMax) {
        where.price = {
          gte: filters.priceMin,
          lte: filters.priceMax,
        };
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [products, totalProducts] = await Promise.all([
        getProductsForCard({
          limit: perPage,
          offset,
          filters: { ...filters, collection: collection },
          sortBy,
        }),
        prisma.product.count({ where }),
      ]);

      return { products, totalProducts };
    },
    ["collection-products", JSON.stringify(options)],
    {
      tags: ["collections", "products"],
      revalidate: 60 * 60, // 1 hour
    }
  )();
}

// A function to get flash sale data using the unified getProductsForCard
export async function getFlashSaleData() {
  return cache(
    async () => {
      try {
        const now = new Date();

        const flashSaleCollection = await prisma.collection.findFirst({
          where: {
            type: CollectionType.FLASH_SALE,
            isActive: true,
            OR: [
              { startDate: { lte: now }, endDate: { gte: now } },
              { startDate: null, endDate: null },
              { startDate: { lte: now }, endDate: null },
              { startDate: null, endDate: { gte: now } },
            ],
          },
          select: {
            id: true,
            slug: true,
            name: true,
            endDate: true,
          },
        });

        if (!flashSaleCollection) {
          // If no collection is found, this is not an error state, just no data.
          return null;
        }

        const flashSaleProducts = await getProductsForCard({
          filters: {
            collection: flashSaleCollection.slug,
          },
        });

        if (flashSaleProducts.length === 0) {
          // If the collection exists but has no products, also return null
          return null;
        }

        let saleEndDate = flashSaleCollection.endDate;
        if (!saleEndDate) {
          saleEndDate = new Date();
          saleEndDate.setHours(saleEndDate.getHours() + 24);
        }

        return {
          products: flashSaleProducts,
          saleEndDate,
          collectionName: flashSaleCollection.name,
          collectionId: flashSaleCollection.id,
        };
      } catch (error) {
        console.error("Error fetching flash sale data:", error);
        return null;
      }
    },
    ["flash-sale-data"],
    {
      tags: ["flash-sale", "products"],
      revalidate: 60 * 10, // 10 minutes, as sales are time-sensitive
    }
  )();
}
