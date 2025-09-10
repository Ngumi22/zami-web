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

export interface ProductsResponse {
  products: Prisma.ProductGetPayload<{
    include: { brand: true };
  }>[];
  totalProducts: number;
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

export const getCachedCategories = cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
    },
  });
  return categories;
});

export const getCachedBrands = cache(async (): Promise<Brand[]> => {
  const brands = await prisma.brand.findMany();
  return brands;
});

async function getDescendantCategoryIds(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      children: {
        select: {
          id: true,
          children: {
            select: {
              id: true,
              children: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!category) return [];

  const allIds: string[] = [category.id];

  const extractChildIds = (children: any[]) => {
    for (const child of children) {
      allIds.push(child.id);
      if (child.children && child.children.length > 0) {
        extractChildIds(child.children);
      }
    }
  };

  if (category.children) {
    extractChildIds(category.children);
  }

  return allIds;
}

export const getFilterData = cache(
  async (categorySlug: string): Promise<FilterData> => {
    const allDescendantIds = await getDescendantCategoryIds(categorySlug);

    if (allDescendantIds.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 100,
        subcategories: [],
        brands: [],
        specifications: [],
      };
    }

    const [productStats, mainCategoryWithSpecs, availableSubcategories] =
      await Promise.all([
        prisma.product.findMany({
          where: { categoryId: { in: allDescendantIds } },
          select: { price: true, brand: { select: { name: true } } },
        }),

        prisma.category.findUnique({
          where: { slug: categorySlug },
          select: { specifications: true },
        }),

        prisma.category.findMany({
          where: { parentId: allDescendantIds[0] },
        }),
      ]);

    const prices = productStats.map((p) => p.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;

    const availableBrands = Array.from(
      new Set(
        productStats
          .filter((product) => product.brand)
          .map((product) => product.brand!.name)
      )
    );

    const specMetadataMap = new Map();
    if (
      mainCategoryWithSpecs &&
      Array.isArray(mainCategoryWithSpecs.specifications)
    ) {
      mainCategoryWithSpecs.specifications.forEach((spec) => {
        const normalizedId = spec.id.toLowerCase().trim();
        if (!specMetadataMap.has(normalizedId)) {
          specMetadataMap.set(normalizedId, {
            id: spec.id,
            name: spec.name,
            type: spec.type,
            unit: spec.unit ?? undefined,
            options: new Set<string>(),
          });
        }

        const currentSpec = specMetadataMap.get(normalizedId);
        if (Array.isArray(spec.options)) {
          spec.options.forEach((option) => currentSpec.options.add(option));
        }
      });
    }

    const availableSpecifications = Array.from(specMetadataMap.values())
      .filter((spec) => spec.options.size > 0)
      .map((spec) => ({
        id: spec.id,
        name: spec.name,
        type: spec.type,
        unit: spec.unit,
        options: Array.from(spec.options) as string[],
      }));

    return {
      minPrice,
      maxPrice,
      subcategories: availableSubcategories,
      brands: availableBrands,
      specifications: availableSpecifications,
    };
  }
);

export const getProducts = cache(
  async (params: GetProductsParams): Promise<ProductsResponse> => {
    const {
      category: categorySlug,
      subcategories,
      brands,
      specifications: selectedSpecifications = {},
      search,
      sort = "createdAt-desc",
      perPage = 12,
      offset = 0,
      priceMin,
      priceMax,
      collection: collectionSlug,
    } = params;

    if (collectionSlug) {
      return getProductsByCollection(collectionSlug, params);
    }
    if (!categorySlug) {
      return { products: [], totalProducts: 0 };
    }

    const allDescendantIds = await getDescendantCategoryIds(categorySlug);
    if (allDescendantIds.length === 0) {
      return { products: [], totalProducts: 0 };
    }

    const selectedSubcategoriesArray = Array.isArray(subcategories)
      ? subcategories
      : [];
    let targetCategoryIds = allDescendantIds;
    if (selectedSubcategoriesArray.length > 0) {
      const resolvedSubcategoryIds = await prisma.category.findMany({
        where: { slug: { in: selectedSubcategoriesArray } },
        select: { id: true },
      });
      targetCategoryIds = resolvedSubcategoryIds.map((c) => c.id);
    }
    const targetCategoryObjectIds = targetCategoryIds.map((id) => ({
      $oid: id,
    }));

    const matchStage: any = {
      $and: [{ categoryId: { $in: targetCategoryObjectIds } }],
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
      type CategoryWithSpecs = {
        id: string;
        parentId: string | null;
        specifications: Prisma.JsonValue;
      };

      const currentCategory = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true, parentId: true, specifications: true },
      });

      if (currentCategory) {
        let rootCategory: CategoryWithSpecs = currentCategory;
        let parentId: string | null = currentCategory.parentId;
        while (parentId) {
          const parent = await prisma.category.findUnique({
            where: { id: parentId },
            select: { id: true, parentId: true, specifications: true },
          });
          if (!parent) break;

          rootCategory = parent;
          parentId = parent.parentId;
        }

        const specDefinitions = (rootCategory?.specifications || []) as any[];

        const specIdMap = new Map<
          string,
          { id: string; name: string; type: CategorySpecificationType }
        >(
          specDefinitions.map((spec) => [
            spec.id,
            { id: spec.id, name: spec.name, type: spec.type },
          ])
        );

        for (const [specId, values] of Object.entries(selectedSpecifications)) {
          const specInfo = specIdMap.get(specId);
          if (specInfo && values && values.length > 0) {
            let queryValues: any[] = values;
            if (specInfo.type === "NUMBER")
              queryValues = values
                .map((v) => parseFloat(v))
                .filter((v) => !isNaN(v));
            if (specInfo.type === "BOOLEAN")
              queryValues = values.map((v) => v.toLowerCase() === "true");
            if (queryValues.length > 0) {
              matchStage.$and.push({
                [`specifications.${specId}`]: { $in: queryValues },
              });
            }
          }
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
);

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
