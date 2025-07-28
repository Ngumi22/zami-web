import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  newArrivals,
} from "@/data/product";
import { getAllBrands, getBrandById } from "@/data/brands";
import { getAllCategories, getCategoryById } from "@/data/category";
import { Brand, Category, Product } from "@prisma/client";
import { getQueryClient } from "@/app/get-query-client";

const queryClient = getQueryClient();

// PRODUCT HOOKS
export function useProducts(params: Record<string, any> = {}) {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: () => getAllProducts(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export function useProduct(productId: string) {
  return useQuery<Product | null>({
    queryKey: ["products", productId],
    queryFn: () => getProductById(productId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: !!productId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Product[]>(["products"]) || []).find(
        (p: Product) => p.id === productId
      ),
  });
}

export function useNewArrivals(limit: number = 10) {
  return useQuery<Product[]>({
    queryKey: ["products", "new", limit],
    queryFn: () => newArrivals(limit),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Product[]>(["products"])?.slice(0, limit) ||
        []),
  });
}

export function useFeaturedProducts(limit: number = 6) {
  return useQuery<Product[]>({
    queryKey: ["products", "featured", limit],
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient
        .getQueryData<Product[]>(["products"])
        ?.filter((p: Product) => p.featured)
        .slice(0, limit) ||
        []),
  });
}

// BRAND HOOKS
export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: getAllBrands,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
}

export function useBrand(brandId: string) {
  return useQuery<Brand | null>({
    queryKey: ["brands", brandId],
    queryFn: () => getBrandById(brandId),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!brandId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Brand[]>(["brands"]) || []).find(
        (b: Brand) => b.id === brandId
      ) ??
      null,
  });
}

// CATEGORY HOOKS
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
}

export function useCategory(categoryId: string) {
  return useQuery<Category | null>({
    queryKey: ["categories", categoryId],
    queryFn: () => getCategoryById(categoryId),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!categoryId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Category[]>(["categories"]) || []).find(
        (c: Category) => c.id === categoryId
      ) ??
      null,
  });
}

export function useProductsByCategory(categoryId: string, limit?: number) {
  return useQuery<Product[]>({
    queryKey: ["categories", categoryId, "products", limit],
    queryFn: () => getProductsByCategory(categoryId, limit),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled: !!categoryId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Product[]>(["products"]) || []).filter(
        (p: Product) => p.categoryId === categoryId
      ),
  });
}

// OPTIMIZED COMPOSITION HOOKS
export function useStoreInitialData() {
  return useQueries({
    queries: [
      {
        queryKey: ["categories"],
        queryFn: getAllCategories,
        staleTime: 1000 * 60 * 60 * 24,
      },
      {
        queryKey: ["products"],
        queryFn: () => getAllProducts(),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });
}

export function useHomepageData() {
  return useQueries({
    queries: [
      {
        queryKey: ["products"],
        queryFn: () => getAllProducts(6),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: ["products", "featured", 6],
        queryFn: () => getFeaturedProducts(6),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: ["products", "new", 8],
        queryFn: () => newArrivals(8),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["categories"],
        queryFn: () => getAllCategories,
        staleTime: 1000 * 60 * 60 * 6,
      },
    ],
  });
}

export async function prefetchProduct(productId: string) {
  await queryClient.prefetchQuery({
    queryKey: ["products", productId],
    queryFn: () => getProductById(productId),
  });
}

export async function prefetchCategoryProducts(categoryId: string) {
  await queryClient.prefetchQuery({
    queryKey: ["categories", categoryId, "products"],
    queryFn: () => getProductsByCategory(categoryId),
  });
}
