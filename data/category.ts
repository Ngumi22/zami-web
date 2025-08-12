"use server";

import { Brand, Category } from "@prisma/client";
import prisma from "@/lib/prisma";
import { cacheTags } from "@/lib/cache-keys";
import { cache } from "react";

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// Use a shared cached function to fetch all categories once per request
const getCachedCategories = cache(() => {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { children: true },
    cacheStrategy: {
      tags: [cacheTags.categoriesCollection()],
    },
  });
});

export async function getAllCategories(): Promise<CategoryWithChildren[]> {
  const allCategories = await getCachedCategories();
  // We can add in-memory processing here if needed, e.g., building a tree
  return allCategories;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const allCategories = await getCachedCategories();
  const category = allCategories.find((cat) => cat.id === id);
  return category || null;
}

export async function getCategoryWithPath(id: string): Promise<{
  category: CategoryWithChildren;
  path: CategoryWithChildren[];
} | null> {
  const allCategories = await getCachedCategories();
  const category = allCategories.find((cat) => cat.id === id);

  if (!category) {
    return null;
  }

  const path: CategoryWithChildren[] = [];
  let currentCategory: CategoryWithChildren | null = category;

  // Build path in-memory
  while (currentCategory) {
    path.unshift(currentCategory);
    currentCategory =
      allCategories.find((cat) => cat.id === currentCategory?.parentId) || null;
  }

  return {
    category: category,
    path: path,
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
