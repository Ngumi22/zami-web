"use server";

import { cacheKeys } from "@/lib/cache-keys";
import prisma from "@/lib/prisma";
import {
  Brand,
  Category,
  CategorySpecificationType,
  Prisma,
} from "@prisma/client";
import { unstable_cache as cache } from "next/cache";

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

export const getCachedCategories = cache(
  async (): Promise<Category[]> => {
    return prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
      },
    });
  },
  ["categories"],
  { tags: ["categories"] }
);

const CACHE_TAG = "brands";
const CACHE_DURATION = 60 * 30;

export const getCachedBrands = cache(
  async () => {
    try {
      const brands = await prisma.brand.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          // isActive: true,
          // description: true,
          // productCount: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return brands;
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  },
  ["get-cached-brands"],
  {
    tags: [CACHE_TAG],
    revalidate: CACHE_DURATION,
  }
);

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
    } = params;

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
    // Escape special regex characters in the search string
    const escapedSearch = search?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (search) {
      matchStage.$and.push({
        $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { description: { $regex: escapedSearch, $options: "i" } },
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
