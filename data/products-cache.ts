"use server";

import { unstable_cache } from "next/cache";
import {
  getProductsByFilters,
  ProductFilters,
  ProductsResponse,
} from "@/data/product-filters";

// Server-side cache with aggressive caching
const getCachedProducts = unstable_cache(
  async (filters: ProductFilters): Promise<ProductsResponse> => {
    return await getProductsByFilters(filters);
  },
  ["products"],
  {
    revalidate: 300, // 5 minutes
    tags: ["products"],
  }
);

export async function getInitialProductsData(
  filters: ProductFilters
): Promise<ProductsResponse> {
  try {
    return await getCachedProducts(filters);
  } catch (error) {
    console.error("Cache miss, fetching fresh data:", error);
    return await getProductsByFilters(filters);
  }
}

// Preload common filter combinations
export async function preloadCommonFilters() {
  const commonFilters: ProductFilters[] = [
    { sort: "latest", page: 1, limit: 12 },
    { sort: "price-asc", page: 1, limit: 12 },
    { sort: "rating-desc", page: 1, limit: 12 },
    { featured: true, page: 1, limit: 12 },
  ];

  // Preload in background
  Promise.all(commonFilters.map((filters) => getCachedProducts(filters))).catch(
    console.warn
  );
}
