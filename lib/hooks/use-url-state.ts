"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FilterState } from "../def";

const DEFAULT_FILTER_STATE: FilterState = {
  category: "smartphones",
  subcategories: [],
  brands: [],
  priceMin: 0,
  priceMax: Infinity,
  sort: "rating",
  page: 1,
  pageSize: 9,
  specifications: {},
};

const FILTER_KEYS = new Set([
  "category",
  "subcats",
  "brands",
  "priceMin",
  "priceMax",
  "sort",
  "page",
  "pageSize",
]);

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    return parseUrlState(searchParams);
  }, [searchParams]);

  const updateState = useCallback(
    (updates: Partial<FilterState>) => {
      const current = new URLSearchParams(window.location.search);
      const next = new URLSearchParams();

      const getParam = (key: string) =>
        updates[key as keyof FilterState] ?? current.get(key);

      const setParamIfExists = (key: string, val: string | null) => {
        if (val != null && val !== "") next.set(key, val);
      };

      setParamIfExists(
        "category",
        updates.category ?? current.get("category") ?? state.category
      );

      if (updates.subcategories !== undefined) {
        if (updates.subcategories.length)
          next.set("subcats", updates.subcategories.join(","));
      } else if (current.has("subcats")) {
        next.set("subcats", current.get("subcats")!);
      }

      if (updates.brands !== undefined) {
        if (updates.brands.length) next.set("brands", updates.brands.join(","));
      } else if (current.has("brands")) {
        next.set("brands", current.get("brands")!);
      }

      if (updates.priceMin !== undefined) {
        next.set("priceMin", String(updates.priceMin));
      } else if (current.has("priceMin")) {
        next.set("priceMin", current.get("priceMin")!);
      }

      if (updates.priceMax !== undefined) {
        next.set("priceMax", String(updates.priceMax));
      } else if (current.has("priceMax")) {
        next.set("priceMax", current.get("priceMax")!);
      }

      if (updates.sort !== undefined) {
        next.set("sort", updates.sort);
      } else if (current.has("sort")) {
        next.set("sort", current.get("sort")!);
      }

      if (updates.page !== undefined) {
        next.set("page", String(updates.page));
      } else if (current.has("page")) {
        next.set("page", current.get("page")!);
      }

      if (updates.pageSize !== undefined) {
        next.set("pageSize", String(updates.pageSize));
      } else if (current.has("pageSize")) {
        next.set("pageSize", current.get("pageSize")!);
      }

      // Handle specifications
      if (updates.specifications !== undefined) {
        const updatedSpecs = updates.specifications;

        // Clear all non-filter keys
        for (const key of current.keys()) {
          if (!FILTER_KEYS.has(key)) continue;
          if (!next.has(key)) next.set(key, current.get(key)!);
        }

        Object.entries(updatedSpecs).forEach(([key, val]) => {
          if (Array.isArray(val) && val.length > 0) {
            next.set(key, val.join(","));
          }
        });
      } else {
        for (const [key, val] of current.entries()) {
          if (!FILTER_KEYS.has(key)) {
            next.set(key, val);
          }
        }
      }

      const newUrl = `${pathname}?${next.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname, state]
  );

  const clearFilters = useCallback(() => {
    const category = state.category || DEFAULT_FILTER_STATE.category;
    const url = `${pathname}?category=${category}`;
    router.replace(url, { scroll: false });
  }, [router, pathname, state.category]);

  return {
    state,
    updateState,
    clearFilters,
  };
}

function parseUrlState(params: URLSearchParams): FilterState {
  const state: FilterState = { ...DEFAULT_FILTER_STATE };
  const specs: Record<string, string[]> = {};

  for (const [key, value] of params.entries()) {
    if (!value) continue;

    switch (key) {
      case "category":
        state.category = value;
        break;
      case "subcats":
        state.subcategories = value.split(",").filter(Boolean);
        break;
      case "brands":
        state.brands = value.split(",").filter(Boolean);
        break;
      case "priceMin":
        const min = Number(value);
        if (!isNaN(min)) state.priceMin = min;
        break;
      case "priceMax":
        const max = Number(value);
        if (!isNaN(max)) state.priceMax = max;
        break;
      case "sort":
        state.sort = value;
        break;
      case "page":
        const page = Number(value);
        if (!isNaN(page) && page > 0) state.page = page;
        break;
      case "pageSize":
        const pageSize = Number(value);
        if (!isNaN(pageSize) && pageSize > 0) state.pageSize = pageSize;
        break;
      default:
        specs[key] = value.split(",").filter(Boolean);
        break;
    }
  }

  state.specifications = specs;
  return state;
}
