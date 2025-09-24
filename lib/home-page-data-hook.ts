"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/data/category";
import { Category } from "@prisma/client";
import {
  getAllProducts,
  getFeaturedProducts,
  getFlashSaleData,
  newArrivals,
  ProductCardData,
} from "@/data/fetch-all";

export function useHomeData({
  initialProducts,
  initialFeatured,
  initialNewArrivals,
  initialCategories,
  initialFlashSaleData,
}: {
  initialProducts: ProductCardData[];
  initialFeatured: ProductCardData[];
  initialNewArrivals: ProductCardData[];
  initialCategories: Category[];
  initialFlashSaleData: Awaited<ReturnType<typeof getFlashSaleData>>;
}) {
  const productsQuery = useQuery({
    queryKey: ["homepage", "products"],
    queryFn: () => getAllProducts(6),
    initialData: initialProducts,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
  });

  const featuredQuery = useQuery({
    queryKey: ["homepage", "featured"],
    queryFn: () => getFeaturedProducts(),
    initialData: initialFeatured,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
  });

  const newArrivalsQuery = useQuery({
    queryKey: ["homepage", "new-arrivals"],
    queryFn: () => newArrivals(),
    initialData: initialNewArrivals,
    staleTime: 1000 * 60 * 60, // 60 minutes
    gcTime: 1000 * 60 * 60 * 2, // 120 minutes
    refetchOnWindowFocus: false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["homepage", "categories"],
    queryFn: getAllCategories,
    initialData: initialCategories,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
    refetchOnWindowFocus: false,
  });

  const flashSaleQuery = useQuery({
    queryKey: ["homepage", "flash-sale"],
    queryFn: getFlashSaleData,
    initialData: initialFlashSaleData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  return {
    products: productsQuery.data,
    featured: featuredQuery.data,
    newProducts: newArrivalsQuery.data,
    categories: categoriesQuery.data,
    flashSaleData: flashSaleQuery.data,
    queries: {
      productsQuery,
      featuredQuery,
      newArrivalsQuery,
      categoriesQuery,
      flashSaleQuery,
    },
  };
}
