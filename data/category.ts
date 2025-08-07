"use server";

import { Brand, Category } from "@prisma/client";
import prisma from "@/lib/prisma";
import { cacheTags } from "@/lib/cache-keys";

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      children: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.categories()],
    },
  });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [cacheTags.category(id)],
    },
  });
}

async function buildCategoryPath(
  categoryId: string
): Promise<CategoryWithChildren[]> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: true,
      children: true,
    },
  });

  if (!category) return [];
  if (!category.parent)
    return [{ ...category, children: category.children || [] }];

  const parentPath = await buildCategoryPath(category.parent.id);
  return [...parentPath, { ...category, children: category.children || [] }];
}

export async function getCategoryWithPath(id: string): Promise<{
  category: CategoryWithChildren;
  path: CategoryWithChildren[];
} | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
    },
  });

  if (!category) return null;

  const path = await buildCategoryPath(id);
  return {
    category: { ...category, children: category.children || [] },
    path,
  };
}

export async function getMegaMenuCategories() {
  const rawCategories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: true,
      products: {
        where: { featured: true },
        take: 3,
      },
    },
    cacheStrategy: {
      ttl: 60 * 60 * 24 * 7,
      swr: 60 * 60 * 24 * 2,
      tags: [`categories`],
    },
  });

  const brands = await prisma.brand.findMany({
    take: 5,
  });

  const categories = rawCategories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    children: cat.children.map((child: any) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      children: [],
      featuredProducts: [],
      popularBrands: [],
    })),
    featuredProducts: cat.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      image: p.mainImage,
      price: p.price,
    })),
    popularBrands: brands.map((brand: Brand) => ({
      id: brand.id,
      name: brand.name,
    })),
  }));

  return categories;
}
