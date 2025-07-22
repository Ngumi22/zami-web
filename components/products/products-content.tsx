"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Package,
} from "lucide-react";
import { ProductFilters, useFilterState } from "./product-filters";

import ProductGrid from "./product-grid";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MobileProductFilters } from "./mobile-filters";
import { Brand, Category, Product } from "@prisma/client";

interface ProductsContentProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  searchParams: any;
}

// Enhanced pagination component
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Calculate visible page numbers for better UX
  const getVisiblePages = () => {
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="gap-1">
        <ChevronLeft className="h-4 w-4" />
        {!isMobile && "Previous"}
      </Button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-2 text-slate-500 text-sm">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className="w-10">
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="gap-1">
        {!isMobile && "Next"}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Loading skeleton for products
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

// Results header with improved information display
function ResultsHeader({
  totalProducts,
  currentPage,
  productsPerPage,
  sortValue,
  onSortChange,
  viewMode,
  onViewModeChange,
  isLoading,
}: {
  totalProducts: number;
  currentPage: number;
  productsPerPage: number;
  sortValue: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isLoading: boolean;
}) {
  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Package className="h-4 w-4" />
        <span>
          Showing {startItem}-{endItem} of {totalProducts} products
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={sortValue}
          onValueChange={onSortChange}
          disabled={isLoading}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
            <SelectItem value="top-rated">Top Rated</SelectItem>
          </SelectContent>
        </Select>

        {isDesktop && (
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
              disabled={isLoading}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
              disabled={isLoading}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductsContent({
  initialProducts,
  categories,
  brands,
  searchParams,
}: ProductsContentProps) {
  const { filters, updateFilter, resetFilters, isPending } = useFilterState();
  const [products, setProducts] = useState(initialProducts);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.page) || 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  const productsPerPage = 12; // Increased for better UX
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // Enhanced sort function with more options
  const updateSort = useCallback(
    (sortValue: string) => {
      setIsLoading(true);
      const newParams = new URLSearchParams(params.toString());

      if (sortValue === "default") {
        newParams.delete("sort");
      } else {
        newParams.set("sort", sortValue);
      }

      // Reset to first page when sorting changes
      newParams.set("page", "1");
      setCurrentPage(1);

      router.push(`/products?${newParams.toString()}`);

      // Simulate loading delay for better UX
      setTimeout(() => setIsLoading(false), 300);
    },
    [params, router]
  );

  // Enhanced page update with URL sync
  const updatePage = useCallback(
    (page: number) => {
      setIsLoading(true);
      setCurrentPage(page);

      const newParams = new URLSearchParams(params.toString());
      newParams.set("page", String(page));
      router.push(`/products?${newParams.toString()}`);

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => setIsLoading(false), 300);
    },
    [params, router]
  );

  // Enhanced sorting with better performance
  const sortedProducts = useMemo(() => {
    if (!initialProducts?.length) return [];

    try {
      const sortedArray = [...initialProducts];
      const sortBy = searchParams.sort;

      switch (sortBy) {
        case "price-low":
          return sortedArray.sort((a, b) => a.price - b.price);
        case "price-high":
          return sortedArray.sort((a, b) => b.price - a.price);
        case "name":
          return sortedArray.sort((a, b) => a.name.localeCompare(b.name));
        case "newest":
          return sortedArray.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );

        default:
          // Featured products first, then by name
          return sortedArray.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.name.localeCompare(b.name);
          });
      }
    } catch (err) {
      console.error("Error sorting products:", err);
      setError("Failed to sort products");
      return initialProducts;
    }
  }, [initialProducts, searchParams.sort]);

  // Update products when sorting changes
  useEffect(() => {
    setProducts(sortedProducts);
    setError(null);
  }, [sortedProducts]);

  // Sync current page with URL params
  useEffect(() => {
    const pageFromUrl = Number(searchParams.page) || 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams.page, currentPage]);

  // Error boundary effect
  useEffect(() => {
    if (!initialProducts) {
      setError("Failed to load products. Please try again.");
    }
  }, [initialProducts]);

  // Show error state
  if (error) {
    return (
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  // Show empty state
  if (!isLoading && !products?.length) {
    return (
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
            No products found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Try adjusting your filters or search criteria
          </p>
          <Button onClick={resetFilters} variant="outline">
            Clear all filters
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
      {/* Header with mobile filters and sort */}
      <div className="flex items-center justify-between lg:flex-row gap-4 mb-8">
        <ResultsHeader
          totalProducts={products.length}
          currentPage={currentPage}
          productsPerPage={productsPerPage}
          sortValue={searchParams.sort || "default"}
          onSortChange={updateSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading || isPending}
        />

        {/* Mobile filters button */}
        <div className="lg:hidden">
          <MobileProductFilters
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            isPending={isPending}
            brands={brands}
            categories={categories}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop filters sidebar */}
        <aside className="w-full lg:w-80 shrink-0 hidden lg:block">
          <ProductFilters brands={brands} categories={categories} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ProductGridSkeleton />}>
            {isLoading || isPending ? (
              <ProductGridSkeleton />
            ) : (
              <ProductGrid products={paginatedProducts} viewMode={viewMode} />
            )}

            {/* Enhanced pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={updatePage}
              isLoading={isLoading || isPending}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
