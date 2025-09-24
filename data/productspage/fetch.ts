"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { CategorySpecificationType } from "@prisma/client";
import type { ProductVariant } from "@prisma/client";

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

export interface GetProductsParams {
  category?: string;
  subcategories?: string[] | string;
  brands?: string[] | string;
  specifications?: Record<string, string[]>;
  search?: string;
  sort?: string;
  perPage?: number;
  offset?: number;
  priceMin?: number;
  priceMax?: number;
}

export interface ProductsResponse {
  products: ProductCardData[];
  totalProducts: number;
}

export async function getDescendantCategoryIds(
  slug: string
): Promise<string[]> {
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
        $lookup: {
          from: "Brand",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
        },
      },
      {
        $lookup: {
          from: "Category",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "Collection",
          localField: "collectionId",
          foreignField: "_id",
          as: "collectionData",
        },
      },
      {
        $lookup: {
          from: "ProductVariant",
          localField: "id",
          foreignField: "productId",
          as: "variantsData",
        },
      },
      {
        $lookup: {
          from: "Category",
          localField: "categoryData.parentId",
          foreignField: "_id",
          as: "parentCategoryData",
        },
      },
      {
        $facet: {
          paginatedResults: [
            { $sort: sortStage },
            { $skip: offset },
            { $limit: perPage },
            {
              $project: {
                _id: 0,
                id: { $toString: "$_id" },
                slug: 1,
                name: 1,
                price: 1,
                originalPrice: 1,
                mainImage: 1,
                stock: 1,
                hasVariants: 1,
                priceRange: 1,
                brand: { $arrayElemAt: ["$brandData.name", 0] },
                category: {
                  name: { $arrayElemAt: ["$categoryData.name", 0] },
                  slug: { $arrayElemAt: ["$categoryData.slug", 0] },
                  parent: {
                    $cond: {
                      if: {
                        $ne: [
                          { $arrayElemAt: ["$parentCategoryData", 0] },
                          null,
                        ],
                      },
                      then: {
                        name: { $arrayElemAt: ["$parentCategoryData.name", 0] },
                        slug: { $arrayElemAt: ["$parentCategoryData.slug", 0] },
                      },
                      else: null,
                    },
                  },
                },
                collection: { $arrayElemAt: ["$collectionData.name", 0] },
                variants: "$variantsData",
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
