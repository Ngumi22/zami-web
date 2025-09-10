"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import { Category } from "@prisma/client";

interface FilterSortBarProps {
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

export function FilterSortBar({
  categories,
  currentCategory,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
}: FilterSortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice ? Number.parseFloat(currentMinPrice) : 0,
    currentMaxPrice ? Number.parseFloat(currentMaxPrice) : 1000,
  ]);

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all" && value !== "featured") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handlePriceCommit = (values: number[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (values[0] > 0) {
      params.set("minPrice", values[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (values[1] < 1000) {
      params.set("maxPrice", values[1].toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(window.location.pathname, { scroll: false });
    setPriceRange([0, 1000]);
  };

  const activeFiltersCount = [
    currentCategory,
    currentSort && currentSort !== "featured",
    currentMinPrice,
    currentMaxPrice,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 mb-8">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter */}
          <Select
            value={currentCategory || "all"}
            onValueChange={(value) => updateSearchParams("category", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.slug.toLowerCase().replace(/\s+/g, "-")}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={currentSort || "featured"}
            onValueChange={(value) => updateSearchParams("sort", value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2">
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  onValueCommit={handlePriceCommit}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {currentCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((cat) => cat.slug === currentCategory)?.name ||
                currentCategory}
              <button
                onClick={() => updateSearchParams("category", null)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentSort && currentSort !== "featured" && (
            <Badge variant="secondary" className="gap-1">
              {currentSort === "price-low"
                ? "Price: Low to High"
                : currentSort === "price-high"
                ? "Price: High to Low"
                : currentSort === "newest"
                ? "Newest First"
                : currentSort === "rating"
                ? "Highest Rated"
                : currentSort}
              <button
                onClick={() => updateSearchParams("sort", null)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(currentMinPrice || currentMaxPrice) && (
            <Badge variant="secondary" className="gap-1">
              Ksh{currentMinPrice || "0"} - Ksh{currentMaxPrice || "1000"}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("minPrice");
                  params.delete("maxPrice");
                  router.push(`?${params.toString()}`, { scroll: false });
                  setPriceRange([0, 1000]);
                }}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
