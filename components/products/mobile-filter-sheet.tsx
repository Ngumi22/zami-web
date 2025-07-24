"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import FilterSidebar from "./filter-sidebar";
import { ProductFilters, ProductsResponse } from "@/data/product-filters";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductFilters;
  facets: ProductsResponse["facets"];
  priceRange: { min: number; max: number };
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onClearFilters: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortValue: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export default function MobileFilterSheet({
  open,
  onOpenChange,
  filters,
  facets,
  priceRange,
  onFiltersChange,
  onPriceRangeChange,
  onClearFilters,
  searchQuery,
  onSearchChange,
  sortValue,
  onSortChange,
}: MobileFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters & Sort</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <Select value={sortValue} onValueChange={onSortChange}>
              <SelectTrigger className="transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <FilterSidebar
            filters={filters}
            facets={facets}
            priceRange={priceRange}
            onFiltersChange={onFiltersChange}
            onPriceRangeChange={onPriceRangeChange}
            onClearFilters={onClearFilters}
          />

          {/* Apply Button */}
          <div className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full transition-all duration-200 hover:scale-105">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
