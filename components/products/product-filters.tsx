"use client";

import type React from "react";

import {
  useState,
  useEffect,
  useTransition,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  RotateCcw,
  Check,
  Star,
  Package,
  Tag,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import { Brand, Category } from "@prisma/client";

interface FilterState {
  category: string;
  brand: string;
  sort: string;
  priceRange: [number, number];
  inStock: boolean;
  rating: string;
  tags: string[];
}

const DEFAULT_FILTERS: FilterState = {
  category: "",
  brand: "",
  sort: "newest",
  priceRange: [0, 5000],
  inStock: false,
  rating: "",
  tags: [],
};

const STORAGE_KEY = "product-filters";

// Hook for managing filter state with localStorage and URL sync
export function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize filters from URL params and localStorage
  const [filters, setFilters] = useState<FilterState>(() => {
    // First try URL params
    const urlFilters: FilterState = {
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand") || "",
      sort: searchParams.get("sort") || "newest",
      priceRange: [
        Number(searchParams.get("min_price") || 0),
        Number(searchParams.get("max_price") || 5000),
      ],
      inStock: searchParams.get("inStock") === "true",
      rating: searchParams.get("rating") || "",
      tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    };

    // If no URL params, try localStorage
    if (typeof window !== "undefined" && !searchParams.toString()) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
        }
      } catch (error) {
        console.warn("Failed to parse stored filters:", error);
      }
    }

    return urlFilters;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn("Failed to save filters to localStorage:", error);
    }
  }, [filters]);

  // Debounced URL update
  const updateUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.brand) params.set("brand", newFilters.brand);
      if (newFilters.sort !== "newest") params.set("sort", newFilters.sort);
      if (newFilters.priceRange[0] > 0)
        params.set("min_price", String(newFilters.priceRange[0]));
      if (newFilters.priceRange[1] < 5000)
        params.set("max_price", String(newFilters.priceRange[1]));
      if (newFilters.inStock) params.set("inStock", "true");
      if (newFilters.rating) params.set("rating", newFilters.rating);
      if (newFilters.tags.length > 0)
        params.set("tags", newFilters.tags.join(","));

      params.set("page", "1");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrlParams(filters);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters, updateUrlParams]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  return {
    filters,
    updateFilter,
    resetFilters,
    isPending,
  };
}

// Collapsible filter section component
function FilterSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium text-slate-900 dark:text-slate-50 hover:bg-transparent">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>{title}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="space-y-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Show more/less component for long lists
function ExpandableList({
  items,
  renderItem,
  maxVisible = 5,
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  maxVisible?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <div className="space-y-2">
      {visibleItems.map(renderItem)}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="h-8 px-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
          {showAll ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {items.length - maxVisible} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}

interface ProductFiltersProps {
  brands: Brand[];
  categories: Category[];
}

export function ProductFilters({ brands, categories }: ProductFiltersProps) {
  const { filters, updateFilter, resetFilters, isPending } = useFilterState();

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: "🆕" },
    { value: "price-asc", label: "Price: Low to High", icon: "💰" },
    { value: "price-desc", label: "Price: High to Low", icon: "💎" },
    { value: "top-rated", label: "Top Rated", icon: "⭐" },
    { value: "popular", label: "Most Popular", icon: "🔥" },
  ];

  const ratingOptions = [
    { value: "4", label: "4+ Stars", count: 156 },
    { value: "3", label: "3+ Stars", count: 289 },
    { value: "2", label: "2+ Stars", count: 412 },
    { value: "1", label: "1+ Stars", count: 523 },
  ];

  const popularTags = [
    { id: "bestseller", label: "Bestseller", count: 45 },
    { id: "new-arrival", label: "New Arrival", count: 23 },
    { id: "sale", label: "On Sale", count: 67 },
    { id: "premium", label: "Premium", count: 34 },
    { id: "eco-friendly", label: "Eco-Friendly", count: 28 },
    { id: "limited-edition", label: "Limited Edition", count: 12 },
    { id: "trending", label: "Trending", count: 89 },
    { id: "featured", label: "Featured", count: 56 },
  ];

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.sort !== "newest") count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    if (filters.inStock) count++;
    if (filters.rating) count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  }, [filters]);

  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...filters.tags, tagId];
    updateFilter("tags", newTags);
  };

  // Desktop view
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-6">
        <div
          className={`space-y-6 ${
            isPending ? "opacity-50 pointer-events-none" : ""
          }`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              className="h-8 px-2 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-1">
                {filters.category && (
                  <Badge variant="outline" className="text-xs">
                    {categories.find((c) => c.id === filters.category)?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => updateFilter("category", "")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.brand && (
                  <Badge variant="outline" className="text-xs">
                    {brands.find((b) => b.id === filters.brand)?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => updateFilter("brand", "")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {popularTags.find((t) => t.id === tag)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => handleTagToggle(tag)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Categories */}
          <FilterSection title="Categories" icon={Package}>
            <RadioGroup
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
              disabled={isPending}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="category-all" />
                <Label htmlFor="category-all" className="text-sm">
                  All Categories
                </Label>
              </div>
              <ExpandableList
                items={categories}
                renderItem={(category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={category.id}
                      id={`category-${category.id}`}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm flex-1">
                      {category.name}
                    </Label>
                    <span className="text-xs text-slate-500">
                      ({category.count || 0})
                    </span>
                  </div>
                )}
              />
            </RadioGroup>
          </FilterSection>

          <Separator />

          {/* Brands */}
          <FilterSection title="Brands" icon={Tag}>
            <RadioGroup
              value={filters.brand}
              onValueChange={(value) => updateFilter("brand", value)}
              disabled={isPending}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="brand-all" />
                <Label htmlFor="brand-all" className="text-sm">
                  All Brands
                </Label>
              </div>
              <ExpandableList
                items={brands}
                renderItem={(brand, index) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={brand.id} id={`brand-${brand.id}`} />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="text-sm flex-1">
                      {brand.name}
                    </Label>
                    <span className="text-xs text-slate-500">
                      ({brand.count || 0})
                    </span>
                  </div>
                )}
              />
            </RadioGroup>
          </FilterSection>

          <Separator />

          {/* Price Range */}
          <FilterSection title="Price Range" icon={DollarSign}>
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) =>
                  updateFilter("priceRange", value as [number, number])
                }
                min={0}
                max={5000}
                step={50}
                disabled={isPending}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Ksh {filters.priceRange[0].toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Ksh {filters.priceRange[1].toLocaleString()}
                </div>
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Rating */}
          <FilterSection title="Customer Rating" icon={Star}>
            <RadioGroup
              value={filters.rating}
              onValueChange={(value) => updateFilter("rating", value)}
              disabled={isPending}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="rating-all" />
                <Label htmlFor="rating-all" className="text-sm">
                  All Ratings
                </Label>
              </div>
              {ratingOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`rating-${option.value}`}
                  />
                  <Label
                    htmlFor={`rating-${option.value}`}
                    className="text-sm flex-1">
                    <div className="flex items-center gap-1">
                      {[...Array(Number(option.value))].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="ml-1">{option.label}</span>
                    </div>
                  </Label>
                  <span className="text-xs text-slate-500">
                    ({option.count})
                  </span>
                </div>
              ))}
            </RadioGroup>
          </FilterSection>

          <Separator />

          {/* Tags */}
          <FilterSection title="Product Tags" icon={Tag}>
            <div className="space-y-2">
              <ExpandableList
                items={popularTags}
                renderItem={(tag, index) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={filters.tags.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm flex-1 cursor-pointer">
                      {tag.label}
                    </Label>
                    <span className="text-xs text-slate-500">
                      ({tag.count})
                    </span>
                  </div>
                )}
              />
            </div>
          </FilterSection>

          <Separator />

          {/* Sort Options */}
          <FilterSection title="Sort By" icon={ArrowUpDown}>
            <RadioGroup
              value={filters.sort}
              onValueChange={(value) => updateFilter("sort", value)}
              disabled={isPending}>
              {sortOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`sort-${option.value}`}
                  />
                  <Label
                    htmlFor={`sort-${option.value}`}
                    className="text-sm flex-1">
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FilterSection>

          <Separator />

          {/* Additional Options */}
          <FilterSection title="Availability" icon={Check} defaultOpen={false}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) =>
                  updateFilter("inStock", !!checked)
                }
                disabled={isPending}
              />
              <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                In Stock Only
              </Label>
            </div>
          </FilterSection>
        </div>
      </CardContent>
    </Card>
  );
}
