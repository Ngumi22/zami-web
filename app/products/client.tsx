"use client";

import { useMemo, useCallback, memo, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { FiltersSidebar } from "@/components/products/filters/filters-sidebar";
import { VirtualProductGrid } from "@/components/products/filters/virtual-product-grid";
import { ProductToolbar } from "@/components/products/filters/product-toolbar";
import { MobileFiltersSheet } from "@/components/products/filters/mobile-filters-sheet";
import { CategoryNavigation } from "@/components/products/filters/category-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductWithDetails } from "@/data/product-page-product";
import { BrandWithProductCount, OutputCategory } from "@/data/cat";
import { useProductsPageData } from "@/lib/hooks";

const Memoized = {
  FiltersSidebar: memo(FiltersSidebar),
  VirtualProductGrid: memo(VirtualProductGrid),
  ProductToolbar: memo(ProductToolbar),
  MobileFiltersSheet: memo(MobileFiltersSheet),
  CategoryNavigation: memo(CategoryNavigation),
};

const RESERVED_PARAMS = new Set([
  "category",
  "subcategories",
  "brands",
  "priceMin",
  "priceMax",
  "sort",
  "page",
  "pageSize",
]);

interface ProductPageProps {
  initialProducts: ProductWithDetails[];
  initialCategories: OutputCategory[];
  initialBrands: BrandWithProductCount[];
  initialFilters: {
    category?: string;
    subcategories: string[];
    brands: string[];
    priceMin: number;
    priceMax: number;
    sort: "rating" | "low" | "high" | "newest" | "popularity";
    page: number;
    pageSize: number;
    specifications: Record<string, string[]>;
  };
  totalCount: number;
  maxPrice: number;
}

export default function ClientProductsPage({
  initialProducts,
  initialCategories,
  initialBrands,
  initialFilters,
  totalCount: initialTotalCount,
  maxPrice: initialMaxPrice,
}: ProductPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const specifications: Record<string, string[]> = {};

    for (const [key, value] of params.entries()) {
      if (!RESERVED_PARAMS.has(key) && value) {
        specifications[key] = value.split(",");
      }
    }

    return {
      category: params.get("category") ?? initialFilters.category,
      subcategories: params.has("subcategories")
        ? params.get("subcategories")!.split(",")
        : initialFilters.subcategories,
      brands: params.has("brands")
        ? params.get("brands")!.split(",")
        : initialFilters.brands,
      priceMin: params.has("priceMin")
        ? Number(params.get("priceMin"))
        : initialFilters.priceMin,
      priceMax: params.has("priceMax")
        ? Number(params.get("priceMax"))
        : initialFilters.priceMax,
      sort: (params.get("sort") as any) ?? initialFilters.sort,
      specifications,
    };
  }, [searchParams, initialFilters]);

  const { currentCategory, maxPrice, productsInfiniteQuery } =
    useProductsPageData({
      initialCategories,
      initialBrands,
      initialMaxPrice,
      currentCategorySlug: currentFilters.category ?? "laptops",
      productsQueryParams: { ...initialFilters, ...currentFilters },
      initialProducts,
      initialTotalCount,
    });

  const handleFilterChange = useCallback(
    (updates: Partial<typeof currentFilters>) => {
      startTransition(() => {
        const newParams = new URLSearchParams(searchParams);
        const { specifications: updatedSpecs, ...otherUpdates } = updates;

        if (updatedSpecs !== undefined) {
          Object.keys(currentFilters.specifications).forEach((specKey) =>
            newParams.delete(specKey)
          );
          Object.entries(updatedSpecs).forEach(([specKey, specValues]) => {
            if (specValues && specValues.length > 0) {
              newParams.set(specKey, specValues.join(","));
            }
          });
        }

        Object.entries(otherUpdates).forEach(([key, value]) => {
          const shouldDelete =
            value === undefined ||
            value === null ||
            (Array.isArray(value) && value.length === 0) ||
            (key === "priceMin" && value === 0) ||
            (key === "priceMax" && value >= maxPrice);

          if (shouldDelete) {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        });

        router.replace(`${pathname}?${newParams.toString()}`, {
          scroll: false,
        });
      });
    },
    [searchParams, router, pathname, maxPrice, currentFilters.specifications]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    productsInfiniteQuery;

  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.products) || initialProducts,
    [data, initialProducts]
  );

  const handleClearAllFilters = useCallback(() => {
    handleFilterChange({
      subcategories: [],
      brands: [],
      priceMin: 0,
      priceMax: maxPrice,
      specifications: {},
    });
  }, [handleFilterChange, maxPrice]);

  const filtersSidebarProps = useMemo(
    () => ({
      categories: initialCategories,
      brands: initialBrands,
      currentCategory,
      maxPrice,
      selectedSubcategories: currentFilters.subcategories,
      selectedBrands: currentFilters.brands,
      priceMin: currentFilters.priceMin,
      priceMax: currentFilters.priceMax,
      selectedSpecs: currentFilters.specifications,
      onSubcategoriesChange: (subcategories: string[]) =>
        handleFilterChange({ subcategories }),
      onBrandsChange: (brands: string[]) => handleFilterChange({ brands }),
      onPriceChange: (min: number, max: number) =>
        handleFilterChange({ priceMin: min, priceMax: max }),
      onSpecsChange: (specs: Record<string, string[]>) =>
        handleFilterChange({ specifications: specs }),
      onClearAll: handleClearAllFilters,
    }),
    [
      initialCategories,
      initialBrands,
      currentCategory,
      currentFilters,
      maxPrice,
      handleFilterChange,
      handleClearAllFilters,
    ]
  );

  const productToolbarProps = useMemo(
    () => ({
      totalProducts: data?.pages[0]?.totalCount ?? initialTotalCount,
      currentSort: currentFilters.sort,
      showingCount: allProducts.length,
      onSortChange: (sort: string) => handleFilterChange({ sort: sort as any }),
    }),
    [
      data,
      initialTotalCount,
      currentFilters.sort,
      allProducts.length,
      handleFilterChange,
    ]
  );

  const hasAnyProducts =
    (allProducts && allProducts.length > 0) ||
    (initialProducts && initialProducts.length > 0);
  if (!hasAnyProducts && isFetching) {
    return (
      <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              ))}
            </div>
          </aside>
          <main className="min-w-0">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/products?category=${initialCategories[0]?.slug ?? ""}`}
          className="hover:text-gray-700 transition-colors">
          Products
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900 truncate">
          {currentCategory?.name}
        </span>
      </nav>

      <div className="mb-2">
        <Memoized.CategoryNavigation
          categories={initialCategories}
          currentCategory={currentCategory?.slug}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] md:gap-16">
        <aside className="hidden md:block">
          <div className="sticky top-8">
            <Memoized.FiltersSidebar {...filtersSidebarProps} />
          </div>
        </aside>

        <main className="min-w-0 relative">
          {isPending && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="text-sm text-gray-600">Updating...</div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 lg:hidden">
            <Memoized.MobileFiltersSheet {...filtersSidebarProps} />
            <div className="flex-1 ml-4">
              <Memoized.ProductToolbar {...productToolbarProps} />
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end">
            <Memoized.ProductToolbar {...productToolbarProps} />
          </div>

          <Memoized.VirtualProductGrid
            products={allProducts}
            hasNextPage={hasNextPage || false}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </main>
      </div>
    </div>
  );
}
