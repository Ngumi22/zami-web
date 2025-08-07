"use client";

import { memo } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FiltersSidebar } from "./filters-sidebar";
import { BrandWithProductCount, OutputCategory } from "@/data/cat";

interface MobileFiltersSheetProps {
  categories: OutputCategory[];
  brands: BrandWithProductCount[];
  currentCategory: OutputCategory;
  selectedSubcategories: string[];
  selectedBrands: string[];
  priceMin: number;
  priceMax: number;
  maxPrice: number;
  selectedSpecs: Record<string, string[]>;
  onSubcategoriesChange: (subcategories: string[]) => void;
  onBrandsChange: (brands: string[]) => void;
  onPriceChange: (min: number, max: number) => void;
  onSpecsChange: (specs: Record<string, string[]>) => void;
  onClearAll: () => void;
}

export const MobileFiltersSheet = memo(function MobileFiltersSheet(
  props: MobileFiltersSheetProps
) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-gray-300 hover:bg-gray-50">
          <Filter className="w-3 h-3 mr-1" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[80vh] w-full bg-white border-t border-gray-200 rounded-t-lg">
        <SheetHeader className="pb-4 border-b border-gray-100">
          <SheetTitle className="text-sm font-medium text-gray-900">
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto h-full pb-20">
          <FiltersSidebar {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
});
