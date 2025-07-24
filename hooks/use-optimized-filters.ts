"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export interface FilterState {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
  inStock: boolean;
  rating: string;
  tags: string[];
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 1,
  inStock: false,
  rating: "",
  tags: [],
};

export function useOptimizedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: Number.parseInt(searchParams.get("page") || "1"),
    inStock: searchParams.get("inStock") === "true",
    rating: searchParams.get("rating") || "",
    tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
  }));

  // Debounce search and price inputs
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedMinPrice = useDebounce(filters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500);

  // Build URL params
  const buildUrlParams = useCallback(
    (newFilters: Partial<FilterState>) => {
      const params = new URLSearchParams();
      const finalFilters = { ...filters, ...newFilters };

      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value && value !== DEFAULT_FILTERS[key as keyof FilterState]) {
          if (key === "tags" && Array.isArray(value)) {
            if (value.length > 0) params.set(key, value.join(","));
          } else if (key === "page" && value === 1) {
            // Don't include page=1 in URL
          } else {
            params.set(key, String(value));
          }
        }
      });

      return params.toString();
    },
    [filters]
  );

  // Update URL and trigger navigation
  const updateUrl = useCallback(
    (newFilters: Partial<FilterState>) => {
      const urlParams = buildUrlParams(newFilters);
      const url = urlParams ? `${pathname}?${urlParams}` : pathname;

      startTransition(() => {
        router.push(url);
      });
    },
    [buildUrlParams, pathname, router]
  );

  // Update single filter
  const updateFilter = useCallback(
    <K extends keyof FilterState>(
      key: K,
      value: FilterState[K],
      resetPage = true
    ) => {
      const newFilters = {
        [key]: value,
        ...(resetPage && key !== "page" ? { page: 1 } : {}),
      };

      setFilters((prev) => ({ ...prev, ...newFilters }));
      updateUrl(newFilters);
    },
    [updateUrl]
  );

  // Update multiple filters at once
  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>, resetPage = true) => {
      const updates = {
        ...newFilters,
        ...(resetPage ? { page: 1 } : {}),
      };

      setFilters((prev) => ({ ...prev, ...updates }));
      updateUrl(updates);
    },
    [updateUrl]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);

  // Toggle tag
  const toggleTag = useCallback(
    (tagId: string) => {
      const newTags = filters.tags.includes(tagId)
        ? filters.tags.filter((t) => t !== tagId)
        : [...filters.tags, tagId];

      updateFilter("tags", newTags);
    },
    [filters.tags, updateFilter]
  );

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.sort !== "newest") count++;
    if (filters.inStock) count++;
    if (filters.rating) count++;
    count += filters.tags.length;
    return count;
  }, [filters]);

  // Get current filters for API call
  const apiFilters = useMemo(
    () => ({
      search: debouncedSearch,
      categoryId: filters.category,
      brandId: filters.brand,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      sort: filters.sort,
      page: filters.page,
      inStock: filters.inStock,
      averageRating: filters.rating,
      tags: filters.tags,
      limit: 12,
    }),
    [
      debouncedSearch,
      filters.category,
      filters.brand,
      debouncedMinPrice,
      debouncedMaxPrice,
      filters.sort,
      filters.page,
      filters.inStock,
      filters.rating,
      filters.tags,
    ]
  );

  return {
    filters,
    apiFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    toggleTag,
    activeFilterCount,
    isPending,
  };
}
