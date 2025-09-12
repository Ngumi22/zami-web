"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import ProductsComponent from "@/components/layout/products-page/new/ProductsComponent";
import {
  type GetProductsParams,
  getProducts,
} from "@/data/productspage/getProducts";
import SortBar from "@/components/layout/products-page/new/sortbar";
import ProductsFilter from "@/components/layout/products-page/new/products-filter";
import SubcategoryFilter from "@/components/layout/products-page/new/subcategory-filter";
import BrandFilter from "@/components/layout/products-page/new/brandsfilter";
import SpecificationFilter from "@/components/layout/products-page/new/specification-filter";
import { useQueryStates } from "nuqs";
import type { Category } from "@prisma/client";
import { parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransition, useState } from "react";
import type { FilterData } from "@/data/productspage/getProducts";
import CategoryBar from "@/components/layout/products-page/new/category-bar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

type ProductsPageClientProps = {
  initialData: {
    categories: Category[];
    sidebarData: FilterData;
  };
};

const baseQueryParsers = {
  category: parseAsString.withDefault(""),
  sort: parseAsString,
  page: parseAsInteger.withDefault(1),
  search: parseAsString,
  perPage: parseAsInteger.withDefault(12),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  subcategories: parseAsArrayOf(parseAsString),
  brands: parseAsArrayOf(parseAsString),
};

export default function ProductsPageClient({
  initialData,
}: ProductsPageClientProps) {
  const { categories, sidebarData } = initialData;
  const [isPending, startTransition] = useTransition();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const specParsers = sidebarData.specifications.reduce((acc, spec) => {
    acc[spec.name] = parseAsArrayOf(parseAsString);
    return acc;
  }, {} as any);

  const allQueryParsers = { ...baseQueryParsers, ...specParsers };

  const [queryParams, setQueryParams] = useQueryStates(allQueryParsers, {
    shallow: false,
    startTransition,
  });

  const specNameIdMap = new Map(
    sidebarData.specifications.map((spec) => [spec.name, spec.id])
  );

  const specifications: Record<string, string[]> = {};
  sidebarData.specifications.forEach((spec) => {
    const specName = spec.name;
    const specId = specNameIdMap.get(specName);

    if (
      specId &&
      queryParams[specName] &&
      (queryParams[specName] as string[]).length > 0
    ) {
      specifications[specId] = queryParams[specName] as string[];
    }
  });

  const {
    category,
    sort,
    search,
    perPage,
    priceMin,
    priceMax,
    subcategories,
    brands,
  } = queryParams;

  const productsParams: Omit<GetProductsParams, "offset"> = {
    category: category || undefined,
    sort: sort || undefined,
    search: search || undefined,
    perPage: perPage || 12,
    priceMax: priceMax || undefined,
    priceMin: priceMin || undefined,
    subcategories: subcategories || undefined,
    brands: brands || undefined,
    specifications,
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", productsParams],
    queryFn: ({ pageParam = 0 }) =>
      getProducts({ ...productsParams, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, page) => sum + page.products.length,
        0
      );
      return loaded < lastPage.totalProducts ? loaded : undefined;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const products = data?.pages.flatMap((page) => page.products) || [];

  const handleCategoryChange = (slug: string) => {
    if (slug !== category) {
      const clearSpecParams = sidebarData.specifications.reduce((acc, spec) => {
        acc[spec.name] = null;
        return acc;
      }, {} as Record<string, null>);

      setQueryParams({
        category: slug,
        page: 1,
        search: null,
        priceMin: null,
        priceMax: null,
        subcategories: null,
        brands: null,
        ...clearSpecParams,
      });
    }
  };

  const activeCategorySlug = category || categories[0].slug!;

  return (
    <section className="flex flex-col gap-4 justify-center mx-auto p-5">
      <CategoryBar
        categories={categories}
        activeCategory={activeCategorySlug}
        onCategoryChange={handleCategoryChange}
        isPending={isPending}
      />
      <div className="md:flex space-y-4 items-center justify-between gap-8">
        <div className="w-full">
          <SortBar />
        </div>

        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
            <SheetHeader className="p-6 pb-4 border-b flex-shrink-0">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
              <ProductsFilter
                minPrice={sidebarData.minPrice}
                maxPrice={sidebarData.maxPrice}
              />
              <SubcategoryFilter subcategories={sidebarData.subcategories} />
              <BrandFilter brands={sidebarData.brands} />
              <SpecificationFilter
                specifications={sidebarData.specifications}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex justify-between gap-8">
        <div className="hidden md:block min-w-60 space-y-4">
          <ProductsFilter
            minPrice={sidebarData.minPrice}
            maxPrice={sidebarData.maxPrice}
          />
          <SubcategoryFilter subcategories={sidebarData.subcategories} />
          <BrandFilter brands={sidebarData.brands} />
          <SpecificationFilter specifications={sidebarData.specifications} />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="relative w-full">
                <Skeleton className="aspect-square w-full rounded-lg bg-gray-100" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded" />
                <Skeleton className="mt-1 h-4 w-1/2 rounded" />
                <Skeleton className="mt-1 h-4 w-1/4 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            <ProductsComponent products={products} />
            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
