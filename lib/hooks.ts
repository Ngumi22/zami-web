import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  newArrivals,
} from "@/data/product";
import { getAllBrands, getBrandById } from "@/data/brands";
import { getAllCategories, getCategoryById } from "@/data/category";
import { Brand, Category, Product } from "@prisma/client";
import { getQueryClient } from "@/app/get-query-client";
import { cacheKeys } from "@/lib/cache-keys";

const queryClient = getQueryClient();

export function useProduct(productId: string) {
  return useQuery<Product | null>({
    queryKey: cacheKeys.product(productId),
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    placeholderData: (previousData) =>
      previousData ??
      queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.find((p) => p.id === productId),
  });
}

export function useProducts(params: Record<string, any> = {}) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.products(params),
    queryFn: () => getAllProducts(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export function useProductBySlug(slug: string) {
  return useQuery<Product | null>({
    queryKey: cacheKeys.productBySlug(slug),
    queryFn: () => getProductBySlug(slug),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: !!slug,
    placeholderData: (previousData) =>
      previousData ??
      queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.find((p) => p.slug === slug) ??
      null,
  });
}

export function useNewArrivals(limit: number = 10) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.newArrivals(limit),
    queryFn: () => newArrivals(limit),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.slice(0, limit) ||
        []),
  });
}

export function useFeaturedProducts(limit: number = 6) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.featured(limit),
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.filter((p: Product) => p.featured)
        .slice(0, limit) ||
        []),
  });
}

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: cacheKeys.brands(),
    queryFn: getAllBrands,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
}

export function useBrand(brandId: string) {
  return useQuery<Brand | null>({
    queryKey: cacheKeys.brand(brandId),
    queryFn: () => getBrandById(brandId),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!brandId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Brand[]>(cacheKeys.brands()) || []).find(
        (b: Brand) => b.id === brandId
      ) ??
      null,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: cacheKeys.categories(),
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
}

export function useCategory(categoryId: string) {
  return useQuery<Category | null>({
    queryKey: cacheKeys.category(categoryId),
    queryFn: () => getCategoryById(categoryId),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!categoryId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Category[]>(cacheKeys.categories()) || []).find(
        (c: Category) => c.id === categoryId
      ) ??
      null,
  });
}

export function useProductsByCategory(categoryId: string, limit?: number) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.productsByCategory(categoryId, limit),
    queryFn: () => getProductsByCategory(categoryId, limit),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled: !!categoryId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Product[]>(cacheKeys.products()) || []).filter(
        (p: Product) => p.categoryId === categoryId
      ),
  });
}

export function useStoreInitialData() {
  return useQueries({
    queries: [
      {
        queryKey: cacheKeys.categories(),
        queryFn: getAllCategories,
        staleTime: 1000 * 60 * 60 * 24,
      },
      {
        queryKey: cacheKeys.products(),
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
        queryKey: cacheKeys.products(),
        queryFn: () => getAllProducts(6),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: cacheKeys.featured(6),
        queryFn: () => getFeaturedProducts(6),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: cacheKeys.newArrivals(8),
        queryFn: () => newArrivals(8),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: cacheKeys.categories(),
        queryFn: getAllCategories,
        staleTime: 1000 * 60 * 60 * 6,
      },
    ],
  });
}

export async function prefetchProduct(productId: string) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.product(productId),
    queryFn: () => getProductById(productId),
  });
}

export async function prefetchCategoryProducts(categoryId: string) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.productsByCategory(categoryId),
    queryFn: () => getProductsByCategory(categoryId),
  });
}
