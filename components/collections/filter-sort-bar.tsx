"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Category, Brand } from "@prisma/client";
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
} from "nuqs";

// The props for current filter values are no longer needed,
// as nuqs will manage the state directly from the URL.
interface FilterSortBarProps {
  categories: Category[];
  availableBrands: Brand[];
  currentSearch?: string;
  totalProducts: number;
  priceRange: { min: number; max: number };
}

export function FilterSortBar({
  categories,
  availableBrands,
  currentSearch,
  totalProducts,
  priceRange,
}: FilterSortBarProps) {
  // useTransition provides visual feedback for pending state updates
  const [isPending, startTransition] = useTransition();

  // useQueryStates from nuqs manages all filter states in the URL.
  // It's type-safe and declarative. `shallow: false` ensures a full
  // page navigation to refetch server data when filters change.
  const [filters, setFilters] = useQueryStates(
    {
      category: parseAsString.withDefault("all"),
      brands: parseAsArrayOf(parseAsString).withDefault([]),
      sort: parseAsString.withDefault("createdAt-desc"),
      priceMin: parseAsInteger,
      priceMax: parseAsInteger,
    },
    {
      history: "push",
      shallow: false,
    }
  );

  const [showFilters, setShowFilters] = useState(false);

  // A local state is used for the slider to provide a smooth UX while dragging.
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.priceMin ?? priceRange.min,
    filters.priceMax ?? priceRange.max,
  ]);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Syncs the local slider state if the URL changes (e.g., browser back/forward).
  useEffect(() => {
    setLocalPriceRange([
      filters.priceMin ?? priceRange.min,
      filters.priceMax ?? priceRange.max,
    ]);
  }, [filters.priceMin, filters.priceMax, priceRange.min, priceRange.max]);

  // Handlers now use startTransition and the nuqs setter `setFilters`.
  const handleCategoryChange = (slug: string) => {
    startTransition(() => {
      setFilters({ category: slug === "all" ? null : slug });
    });
  };

  const handleBrandChange = (brandSlug: string, isChecked: boolean) => {
    const newBrands = new Set(filters.brands);
    if (isChecked) newBrands.add(brandSlug);
    else newBrands.delete(brandSlug);

    startTransition(() => {
      setFilters({ brands: Array.from(newBrands) });
    });
  };

  const handleSortChange = (sort: string) => {
    startTransition(() => {
      setFilters({ sort: sort === "createdAt-desc" ? null : sort });
    });
  };

  // Debounced price update for the slider.
  const handlePriceChange = (values: number[]) => {
    setLocalPriceRange(values);
    if (debounceTimer) clearTimeout(debounceTimer);

    const newTimer = setTimeout(() => {
      startTransition(() => {
        setFilters({
          priceMin: values[0] === priceRange.min ? null : values[0],
          priceMax: values[1] === priceRange.max ? null : values[1],
        });
      });
    }, 500); // 500ms debounce delay

    setDebounceTimer(newTimer);
  };

  const clearFilters = () => {
    startTransition(() => {
      setFilters({
        category: null,
        brands: [],
        sort: null,
        priceMin: null,
        priceMax: null,
      });
    });
  };

  const activeFiltersCount = [
    filters.category !== "all",
    filters.brands.length > 0,
    filters.sort !== "createdAt-desc",
    filters.priceMin,
    filters.priceMax,
    currentSearch,
  ].filter(Boolean).length;

  return (
    <div
      className={`space-y-4 mb-8 transition-opacity ${
        isPending ? "opacity-70" : "opacity-100"
      }`}>
      <div className="text-sm text-muted-foreground">
        {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            value={filters.category}
            onValueChange={handleCategoryChange}
            disabled={isPending}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-between"
                disabled={isPending}>
                <span>
                  {filters.brands.length > 0
                    ? `${filters.brands.length} Brands Selected`
                    : "All Brands"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              <DropdownMenuLabel>Filter by Brand</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableBrands.map((brand) => (
                <DropdownMenuCheckboxItem
                  key={brand.id}
                  checked={filters.brands.includes(brand.slug)}
                  onCheckedChange={(isChecked) =>
                    handleBrandChange(brand.slug, isChecked)
                  }>
                  {brand.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={filters.sort}
            onValueChange={handleSortChange}
            disabled={isPending}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            disabled={isPending}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
            disabled={isPending}>
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>
      {showFilters && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  value={localPriceRange}
                  onValueChange={handlePriceChange}
                  max={priceRange.max}
                  min={priceRange.min}
                  step={1}
                  className="w-full"
                  disabled={isPending}
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Ksh{localPriceRange[0]}</span>
                  <span>Ksh{localPriceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
