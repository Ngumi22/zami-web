"use client";

import { useState, useTransition } from "react";
import SubcategoryFilter from "@/components/layout/products-page/new/subcategory-filter";
import BrandFilter from "@/components/layout/products-page/new/brandsfilter";
import SpecificationFilter from "@/components/layout/products-page/new/specification-filter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import type { FilterData } from "@/data/productspage/getProducts";
import { useQueryStates } from "nuqs";
import { parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import ProductsFilter from "./products-filter";

type ProductsFiltersClientProps = {
  sidebarData: FilterData;
  isMobile?: boolean;
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

export function ProductsFiltersClient({
  sidebarData,
  isMobile = true,
}: ProductsFiltersClientProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const specParsers = sidebarData.specifications.reduce((acc, spec) => {
    acc[spec.name] = parseAsArrayOf(parseAsString);
    return acc;
  }, {} as any);

  const allQueryParsers = { ...baseQueryParsers, ...specParsers };

  const [queryParams, setQueryParams] = useQueryStates(allQueryParsers, {
    shallow: false,
    startTransition,
  });

  const content = (
    <div className="space-y-6">
      <ProductsFilter
        minPrice={sidebarData.minPrice}
        maxPrice={sidebarData.maxPrice}
      />
      <SubcategoryFilter subcategories={sidebarData.subcategories} />
      <BrandFilter brands={sidebarData.brands} />
      <SpecificationFilter specifications={sidebarData.specifications} />
    </div>
  );

  if (isMobile) {
    return (
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
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return content;
}
