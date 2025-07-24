"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  Loader2,
} from "lucide-react";

interface ProductsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortValue: string;
  onSortChange: (sort: string) => void;
  viewMode: 1 | 2 | 3 | 4 | 5;
  onViewModeChange: (mode: 1 | 2 | 3 | 4 | 5) => void;
  totalCount: number;
  isLoading: boolean;
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

const viewModeIcons = {
  1: Grid,
  2: Grid2X2,
  3: Grid3X3,
  4: LayoutGrid,
  5: LayoutGrid,
};

export default function ProductsHeader({
  searchQuery,
  onSearchChange,
  sortValue,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  isLoading,
}: ProductsHeaderProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Results Count */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {totalCount.toLocaleString()} products
          </div>

          {/* Sort */}
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
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

          {/* View Mode - Desktop Only */}
          <div className="hidden md:flex items-center gap-1 border rounded-md p-1">
            {([1, 2, 3, 4, 5] as const).map((mode) => {
              const Icon = viewModeIcons[mode];
              return (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange(mode)}
                  className="w-8 h-8 p-0">
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
