"use client";

import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ProductsLoading from "./loading";
import { ProductFilters, ProductsResponse } from "@/data/product-filters";
import { useOptimizedDebounce } from "@/hooks/use-optimized-debounce";

// Lazy load components for code splitting
const ProductsHeader = dynamic(() => import("./products-header"), {
  loading: () => <div className="h-16 bg-muted animate-pulse rounded-lg" />,
});

const FilterSidebar = dynamic(() => import("./filter-sidebar"), {
  loading: () => (
    <div className="w-64 h-96 bg-muted animate-pulse rounded-lg" />
  ),
});

const ProductGrid = dynamic(() => import("./product-grid"), {
  loading: () => <ProductsLoading />,
});

const ProductPagination = dynamic(() => import("./product-pagination"), {
  loading: () => <div className="h-12 bg-muted animate-pulse rounded-lg" />,
});

const MobileFilterSheet = dynamic(() => import("./mobile-filter-sheet"));

interface ProductsContentProps {
  initialData: ProductsResponse;
  initialFilters: ProductFilters;
}

export default function ProductsContent({
  initialData,
  initialFilters,
}: ProductsContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Direct state management - always sync with server state
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.minPrice || 0,
    max: initialFilters.maxPrice || 10000,
  });
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync local state with server state when initialFilters change
  useEffect(() => {
    setSearchQuery(initialFilters.search || "");
    setPriceRange({
      min: initialFilters.minPrice || 0,
      max: initialFilters.maxPrice || 10000,
    });
  }, [initialFilters.search, initialFilters.minPrice, initialFilters.maxPrice]);

  // Use optimized debounce hooks
  const debouncedSearch = useOptimizedDebounce(searchQuery, 300, "search");
  const debouncedPriceMin = useOptimizedDebounce(priceRange.min, 500, "price");
  const debouncedPriceMax = useOptimizedDebounce(priceRange.max, 500, "price");

  // Refs to track if this is initial mount
  const isInitialMount = useRef(true);

  // URL creation function
  const createUrlFromFilters = useCallback((filters: ProductFilters) => {
    const params = new URLSearchParams();

    // Always add essential parameters
    params.set("sort", filters.sort || "latest");
    params.set("page", (filters.page || 1).toString());
    params.set("limit", (filters.limit || 12).toString());

    // Add optional parameters only if they differ from defaults
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.minPrice && filters.minPrice > 0)
      params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice && filters.maxPrice < 10000)
      params.set("maxPrice", filters.maxPrice.toString());
    if (filters.featured !== undefined)
      params.set("featured", filters.featured.toString());
    if (filters.stock !== undefined)
      params.set("stock", filters.stock.toString());

    // Add tags
    if (filters.tags?.length) {
      filters.tags.forEach((tag) => params.append("tags", tag));
    }

    // Add specifications as individual parameters
    if (
      filters.specifications &&
      Object.keys(filters.specifications).length > 0
    ) {
      Object.entries(filters.specifications).forEach(([key, value]) => {
        // Convert to URL-friendly format with proper encoding
        const urlKey = key.toLowerCase().replace(/\s+/g, "+");
        const urlValue = value.replace(/\s+/g, "+");
        params.set(urlKey, urlValue);
      });
    }

    return params.toString();
  }, []);

  // Direct navigation function with scroll preservation for filters
  const navigateWithFilters = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const updatedFilters = { ...initialFilters, ...newFilters };

      // Reset page to 1 unless explicitly setting page
      if (!newFilters.page) {
        updatedFilters.page = 1;
      }

      const urlParams = createUrlFromFilters(updatedFilters);

      startTransition(() => {
        // Use replace for filter changes to prevent scroll restoration
        if (newFilters.page) {
          // Use push for pagination to allow back/forward navigation
          router.push(`/products?${urlParams}`, { scroll: false });
        } else {
          // Use replace for filters to prevent scroll jump and maintain position
          router.replace(`/products?${urlParams}`, { scroll: false });
        }
      });
    },
    [initialFilters, router, createUrlFromFilters]
  );

  // Handle debounced search navigation in useEffect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debouncedSearch !== (initialFilters.search || "")) {
      navigateWithFilters({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, initialFilters.search, navigateWithFilters]);

  // Handle debounced price navigation in useEffect
  useEffect(() => {
    if (isInitialMount.current) return;

    const minPrice = debouncedPriceMin === 0 ? undefined : debouncedPriceMin;
    const maxPrice =
      debouncedPriceMax === 10000 ? undefined : debouncedPriceMax;

    if (
      minPrice !== initialFilters.minPrice ||
      maxPrice !== initialFilters.maxPrice
    ) {
      navigateWithFilters({ minPrice, maxPrice });
    }
  }, [
    debouncedPriceMin,
    debouncedPriceMax,
    initialFilters.minPrice,
    initialFilters.maxPrice,
    navigateWithFilters,
  ]);

  // Search handler with immediate UI update
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Navigation will be handled by debounced useEffect above
  }, []);

  // Price range handler with immediate UI update
  const handlePriceRangeChange = useCallback((min: number, max: number) => {
    setPriceRange({ min, max });
    // Navigation will be handled by debounced useEffect above
  }, []);

  // Direct filter change handler (no debouncing for checkboxes/dropdowns)
  const handleFiltersChange = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      navigateWithFilters(newFilters);
    },
    [navigateWithFilters]
  );

  // Clear all filters with immediate reset
  const clearFilters = useCallback(() => {
    // Reset local state immediately
    setSearchQuery("");
    setPriceRange({ min: 0, max: 10000 });

    // Navigate to default URL immediately
    startTransition(() => {
      router.replace("/products?sort=latest&page=1&limit=12", {
        scroll: false,
      });
    });
  }, [router]);

  // Page change handler (allow scroll for pagination)
  const handlePageChange = useCallback(
    (page: number) => {
      const updatedFilters = { ...initialFilters, page };
      const urlParams = createUrlFromFilters(updatedFilters);

      startTransition(() => {
        router.push(`/products?${urlParams}`, { scroll: true });
      });
    },
    [initialFilters, router, createUrlFromFilters]
  );

  // Sort change handler (immediate)
  const handleSortChange = useCallback(
    (sort: string) => {
      navigateWithFilters({ sort });
    },
    [navigateWithFilters]
  );

  // Memoized components for performance
  const memoizedProductGrid = useMemo(
    () => (
      <ProductGrid
        products={initialData.products}
        viewMode={viewMode}
        isLoading={isPending}
      />
    ),
    [initialData.products, viewMode, isPending]
  );

  const memoizedFilterSidebar = useMemo(
    () => (
      <FilterSidebar
        filters={initialFilters}
        facets={initialData.facets}
        priceRange={priceRange}
        onFiltersChange={handleFiltersChange}
        onPriceRangeChange={handlePriceRangeChange}
        onClearFilters={clearFilters}
      />
    ),
    [
      initialFilters,
      initialData.facets,
      priceRange,
      handleFiltersChange,
      handlePriceRangeChange,
      clearFilters,
    ]
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductsHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortValue={initialFilters.sort || "latest"}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={initialData.pagination.totalCount}
        isLoading={isPending}
      />

      <div className="flex gap-6 mt-6">
        <div className="hidden lg:block w-64 flex-shrink-0">
          {memoizedFilterSidebar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Filters & Sort
            </button>
          </div>

          <div className="transition-all duration-300 ease-in-out">
            {memoizedProductGrid}
          </div>

          {initialData.pagination.totalPages > 1 && (
            <div className="mt-8 transition-opacity duration-300">
              <ProductPagination
                currentPage={initialData.pagination.currentPage}
                totalPages={initialData.pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={initialData.pagination.hasNext}
                hasPrev={initialData.pagination.hasPrev}
              />
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <MobileFilterSheet
          open={mobileFiltersOpen}
          onOpenChange={setMobileFiltersOpen}
          filters={initialFilters}
          facets={initialData.facets}
          priceRange={priceRange}
          onFiltersChange={handleFiltersChange}
          onPriceRangeChange={handlePriceRangeChange}
          onClearFilters={clearFilters}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortValue={initialFilters.sort || "latest"}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}
