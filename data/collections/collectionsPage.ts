"use server";

import prisma from "@/lib/prisma";
import {
  Brand,
  Category,
  CategorySpecificationType,
  Prisma,
} from "@prisma/client";
import { unstable_cache as cache } from "next/cache";
import {
  Collection,
  CollectionType,
  Product,
  ProductsOnCollections,
} from "@prisma/client";

export interface FlashSaleCreateData {
  name: string;
  productIds: string[];
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface CollectionWithProducts extends Collection {
  products: (ProductsOnCollections & {
    product: Product;
  })[];
  productCount: number;
}

export interface CachedCollection extends Collection {
  products: (ProductsOnCollections & {
    product: Product;
  })[];
}

const CACHE_TAG = "collections";
const CACHE_DURATION = 60 * 5;

export interface GetProductsParams {
  category?: string;
  subcategories?: string[];
  brands?: string[];
  specifications?: Record<string, string[]>;
  search?: string;
  sort?: string;
  perPage?: number;
  offset?: number;
  priceMin?: number;
  priceMax?: number;
  collection?: string;
}

export interface GetCollectionProductsParams {
  collection: string;
  category?: string;
  brands?: string[];
  search?: string;
  sort?: string;
  perPage?: number;
  offset?: number;
  priceMin?: number;
  priceMax?: number;
}

export interface ProductsResponse {
  products: Prisma.ProductGetPayload<{
    include: { brand: true; category: true };
  }>[];
  totalProducts: number;
  priceRange?: { min: number; max: number };
}

export interface FilterData {
  maxPrice: number;
  minPrice: number;
  subcategories: Category[];
  brands: string[];
  specifications: SpecificationFilter[];
}

export interface SpecificationFilter {
  id: string;
  name: string;
  type: CategorySpecificationType;
  options: string[];
  unit?: string;
}

export interface FlashSaleCollection extends Collection {
  products: (ProductsOnCollections & {
    product: Product;
  })[];
  productCount: number;
}

export const getCollectionsWithProducts = cache(
  async (): Promise<CollectionWithProducts[]> => {
    try {
      const collections = await prisma.collection.findMany({
        where: {
          type: {
            not: CollectionType.FLASH_SALE,
          },
        },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              order: "asc",
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return collections
        .filter((collection) => collection._count.products > 0)
        .map((collection) => ({
          ...collection,
          productCount: collection._count.products,
        })) as CollectionWithProducts[];
    } catch (error) {
      console.error("Error fetching collections with products:", error);
      return [];
    }
  },
  ["get-collections-with-products"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export const getCollectionBySlugWithProducts = cache(
  async (slug: string): Promise<CollectionWithProducts | null> => {
    try {
      const collection = await prisma.collection.findUnique({
        where: { slug },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              order: "asc",
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!collection) return null;

      return {
        ...collection,
        productCount: collection._count.products,
      };
    } catch (error) {
      console.error("Error fetching collection by slug:", error);
      return null;
    }
  },
  ["get-collection-by-slug", "slug"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export const getCollectionBySlug = cache(
  async (
    slug: string
  ): Promise<(Collection & { productCount: number }) | null> => {
    try {
      const collection = await prisma.collection.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!collection) return null;

      return {
        ...collection,
        productCount: collection._count.products,
      };
    } catch (error) {
      console.error("Error fetching collection by slug:", error);
      return null;
    }
  },
  ["get-collection-by-slug-light", "slug"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export const getFlashSaleCollections = cache(
  async (): Promise<FlashSaleCollection[]> => {
    try {
      const collections = await prisma.collection.findMany({
        where: {
          type: CollectionType.FLASH_SALE,
        },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              order: "asc",
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return collections.map((collection) => ({
        ...collection,
        productCount: collection._count.products,
      }));
    } catch (error) {
      console.error("Error fetching flash sale collections:", error);
      return [];
    }
  },
  ["get-flash-sale-collections"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export const getCollections = cache(
  async (): Promise<(Collection & { productCount: number })[]> => {
    try {
      const collections = await prisma.collection.findMany({
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return collections.map((collection) => ({
        ...collection,
        productCount: collection._count.products,
      }));
    } catch (error) {
      console.error("Error fetching collections:", error);
      return [];
    }
  },
  ["get-collections"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export const getCollectionById = cache(
  async (id: string): Promise<CachedCollection | null> => {
    try {
      const collection = await prisma.collection.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return collection as CachedCollection | null;
    } catch (error) {
      console.error(`Error fetching collection ${id}:`, error);
      return null;
    }
  },
  ["get-collection-by-id"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export const getCollectionsByType = cache(
  async (type: CollectionType): Promise<CachedCollection[]> => {
    try {
      const collections = await prisma.collection.findMany({
        where: { type },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return collections as CachedCollection[];
    } catch (error) {
      console.error(`Error fetching ${type} collections:`, error);
      return [];
    }
  },
  ["get-collections-by-type"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

export async function getFlashSaleData() {
  try {
    const now = new Date();

    const flashSaleCollection = await prisma.collection.findFirst({
      where: {
        type: CollectionType.FLASH_SALE,
        isActive: true,
        OR: [
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
          {
            startDate: null,
            endDate: { gte: now },
          },
        ],
      },
    });

    if (!flashSaleCollection) {
      console.log("No active flash sale collection found");
      return null;
    }

    const collectionProducts = await prisma.productsOnCollections.findMany({
      where: {
        collectionId: flashSaleCollection.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!collectionProducts || collectionProducts.length === 0) {
      return null;
    }

    const products = collectionProducts.map((poc) => poc.product);

    const validProducts = products.filter(
      (product): product is Product => product !== null
    );

    if (validProducts.length === 0) {
      return null;
    }

    let saleEndDate = flashSaleCollection.endDate;
    if (!saleEndDate) {
      saleEndDate = new Date();
      saleEndDate.setHours(saleEndDate.getHours() + 24);
    }

    return {
      products: validProducts,
      saleEndDate,
      collectionName: flashSaleCollection.name,
      collectionId: flashSaleCollection.id,
    };
  } catch (error) {
    console.error("Error fetching flash sale data:", error);
    return null;
  }
}

export async function getProductsByCollection(
  collectionSlug: string,
  params: Omit<GetProductsParams, "collection">
): Promise<ProductsResponse> {
  const {
    brands,
    specifications: selectedSpecifications = {},
    search,
    sort = "createdAt-desc",
    perPage = 12,
    offset = 0,
    priceMin,
    priceMax,
  } = params;

  const collection = await prisma.collection.findUnique({
    where: { slug: collectionSlug },
    include: {
      products: {
        include: {
          product: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!collection) {
    return { products: [], totalProducts: 0 };
  }

  const productIds = collection.products.map((poc) => poc.productId);

  if (productIds.length === 0) {
    return { products: [], totalProducts: 0 };
  }

  const matchStage: any = {
    $and: [{ _id: { $in: productIds.map((id) => ({ $oid: id })) } }],
  };

  const selectedBrandsArray = Array.isArray(brands) ? brands : [];
  if (selectedBrandsArray.length > 0) {
    const brandObjects = await prisma.brand.findMany({
      where: { name: { in: selectedBrandsArray, mode: "insensitive" } },
      select: { id: true },
    });
    if (brandObjects.length > 0) {
      matchStage.$and.push({
        brandId: { $in: brandObjects.map((b) => ({ $oid: b.id })) },
      });
    }
  }

  const priceFilter: any = {};
  if (priceMin !== undefined) priceFilter.$gte = Number(priceMin);
  if (priceMax !== undefined) priceFilter.$lte = Number(priceMax);
  if (Object.keys(priceFilter).length > 0) {
    matchStage.$and.push({ price: priceFilter });
  }

  if (search) {
    matchStage.$and.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (Object.keys(selectedSpecifications).length > 0) {
    for (const [specId, values] of Object.entries(selectedSpecifications)) {
      if (values && values.length > 0) {
        matchStage.$and.push({
          [`specifications.${specId}`]: { $in: values },
        });
      }
    }
  }

  let sortStage: any = { createdAt: -1 };
  switch (sort) {
    case "price-asc":
      sortStage = { price: 1 };
      break;
    case "price-desc":
      sortStage = { price: -1 };
      break;
    case "name-asc":
      sortStage = { name: 1 };
      break;
    case "name-desc":
      sortStage = { name: -1 };
      break;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        paginatedResults: [
          { $sort: sortStage },
          { $skip: offset },
          { $limit: perPage },
          {
            $lookup: {
              from: "Brand",
              localField: "brandId",
              foreignField: "_id",
              as: "brandData",
            },
          },
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              name: 1,
              slug: 1,
              price: 1,
              mainImage: 1,
              brand: { $arrayElemAt: ["$brandData", 0] },
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await prisma.product.aggregateRaw({
    pipeline: pipeline,
  });

  const data = (results as any)[0];
  const products = data?.paginatedResults || [];
  const totalProducts = data?.totalCount[0]?.count || 0;

  return { products, totalProducts };
}

export interface CollectionFilterData {
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
}

// Get filter data for a collection (categories, brands, price range)
export const getCollectionFilterData = cache(
  async (collectionSlug: string): Promise<CollectionFilterData> => {
    try {
      const collection = await prisma.collection.findUnique({
        where: { slug: collectionSlug },
        include: {
          products: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true,
                },
              },
            },
          },
        },
      });

      if (!collection) {
        return {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 100 },
        };
      }

      const products = collection.products.map((poc) => poc.product);

      // Get unique categories
      const categoryMap = new Map<string, Category>();
      products.forEach((product) => {
        if (product.category) {
          categoryMap.set(product.category.id, product.category);
        }
      });

      // Get unique brands
      const brandMap = new Map<string, Brand>();
      products.forEach((product) => {
        if (product.brand) {
          brandMap.set(product.brand.id, product.brand);
        }
      });

      // Get price range
      const prices = products
        .map((p) => p.price)
        .filter((price) => price !== null);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;

      return {
        categories: Array.from(categoryMap.values()),
        brands: Array.from(brandMap.values()),
        priceRange: { min: minPrice, max: maxPrice },
      };
    } catch (error) {
      console.error("Error fetching collection filter data:", error);
      return {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 100 },
      };
    }
  },
  ["get-collection-filter-data"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

// Get products for a collection with filtering
export const getCollectionProducts = cache(
  async (params: GetCollectionProductsParams): Promise<ProductsResponse> => {
    const {
      collection: collectionSlug,
      category,
      brands,
      search,
      sort = "createdAt-desc",
      perPage = 12,
      offset = 0,
      priceMin,
      priceMax,
    } = params;

    try {
      const collection = await prisma.collection.findUnique({
        where: { slug: collectionSlug },
        include: {
          products: {
            select: { productId: true },
          },
        },
      });

      if (!collection) {
        return {
          products: [],
          totalProducts: 0,
          priceRange: { min: 0, max: 100 },
        };
      }

      const productIds = collection.products.map((poc) => poc.productId);

      if (productIds.length === 0) {
        return {
          products: [],
          totalProducts: 0,
          priceRange: { min: 0, max: 100 },
        };
      }

      const where: Prisma.ProductWhereInput = {
        id: { in: productIds },
      };

      // *** FIXED: Category filter now includes sub-categories ***
      if (category) {
        // Helper function to recursively get all children category IDs
        const getCategoryWithChildrenIds = async (slug: string) => {
          const rootCategory = await prisma.category.findUnique({
            where: { slug },
            include: {
              // You can adjust the depth based on your schema nesting
              children: {
                include: {
                  children: true,
                },
              },
            },
          });

          if (!rootCategory) return [];

          const ids = new Set<string>();
          const queue: Category[] = [rootCategory];

          // Breadth-first search to collect all descendant IDs
          while (queue.length > 0) {
            const current = queue.shift();
            if (current) {
              ids.add(current.id);
              // Prisma typing for relations can be complex, using `as any` for simplicity here
              (current as any).children?.forEach((child: Category) =>
                queue.push(child)
              );
            }
          }
          return Array.from(ids);
        };

        const categoryIds = await getCategoryWithChildrenIds(category);

        if (categoryIds.length > 0) {
          where.categoryId = { in: categoryIds };
        } else {
          // If category filter is active but no category found, return no products.
          where.id = { in: [] };
        }
      }

      if (brands && brands.length > 0) {
        const brandRecords = await prisma.brand.findMany({
          where: { slug: { in: brands } },
        });
        if (brandRecords.length > 0) {
          where.brandId = { in: brandRecords.map((b) => b.id) };
        }
      }

      if (priceMin !== undefined || priceMax !== undefined) {
        where.price = {};
        if (priceMin !== undefined) where.price.gte = priceMin;
        if (priceMax !== undefined) where.price.lte = priceMax;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy: Prisma.ProductOrderByWithRelationInput = {};
      switch (sort) {
        case "price-asc":
          orderBy.price = "asc";
          break;
        case "price-desc":
          orderBy.price = "desc";
          break;
        case "name-asc":
          orderBy.name = "asc";
          break;
        case "name-desc":
          orderBy.name = "desc";
          break;
        default:
          orderBy.createdAt = "desc";
      }

      const [products, totalProducts, priceStats] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            brand: true,
            category: true,
          },
          orderBy,
          skip: offset,
          take: perPage,
        }),
        prisma.product.count({ where }),
        prisma.product.aggregate({
          where: { id: { in: productIds } }, // Aggregate over all collection products for a stable price range
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

      const priceRange = {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 100,
      };

      return {
        products,
        totalProducts,
        priceRange,
      };
    } catch (error) {
      console.error("Error fetching collection products:", error);
      return {
        products: [],
        totalProducts: 0,
        priceRange: { min: 0, max: 100 },
      };
    }
  },
  ["get-collection-products"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

// Get cached categories (parent categories only)
export const getCachedCategories = cache(
  async (): Promise<Category[]> => {
    try {
      return await prisma.category.findMany({
        where: { parentId: null },
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
  ["get-cached-categories"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION * 2,
  }
);

// Get cached brands
export const getCachedBrands = cache(
  async (): Promise<Brand[]> => {
    try {
      return await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  },
  ["get-cached-brands"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION * 2,
  }
);
