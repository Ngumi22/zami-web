"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getProductss } from "@/data/product-services";

export function usePrefetchCategories(
  categories: any[],
  currentCategory: string
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch data for all categories in background
    categories.forEach(async (category) => {
      if (category.slug !== currentCategory) {
        try {
          await queryClient.prefetchQuery({
            queryKey: ["products", { category: category.slug, page: 1 }],
            queryFn: () => getProductss({ category: category.slug, page: 1 }),
            staleTime: 1000 * 60 * 5, // 5 minutes
          });
        } catch (error) {
          // Silent fail
        }
      }
    });
  }, [categories, currentCategory, queryClient]);
}
