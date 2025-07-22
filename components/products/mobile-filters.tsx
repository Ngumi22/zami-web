"use client";

import { useState, useEffect } from "react";
import { Filter, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, Package, Tag, DollarSign, ArrowUpDown } from "lucide-react";
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

interface MobileProductFiltersProps {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
  isPending: boolean;
  brands: Brand[];
  categories: Category[];
}

export function MobileProductFilters({
  filters,
  updateFilter,
  resetFilters,
  isPending,
  categories,
  brands,
}: MobileProductFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
  const activeFilterCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (key === "category" && value) return count + 1;
      if (key === "brand" && value) return count + 1;
      if (key === "sort" && value !== "newest") return count + 1;
      if (key === "priceRange" && (value[0] > 0 || value[1] < 5000))
        return count + 1;
      if (key === "inStock" && value) return count + 1;
      if (key === "rating" && value) return count + 1;
      if (key === "tags" && value.length > 0) return count + value.length;
      return count;
    },
    0
  );

  const handleLocalFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = localFilters.tags.includes(tagId)
      ? localFilters.tags.filter((t) => t !== tagId)
      : [...localFilters.tags, tagId];
    handleLocalFilterChange("tags", newTags);
  };

  const applyFilters = () => {
    // Apply all filter changes at once
    Object.entries(localFilters).forEach(([key, value]) => {
      updateFilter(key as keyof FilterState, value);
    });
    setOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] w-full p-0">
        <SheetHeader className="border-b h-16 px-4 flex flex-row items-center justify-between">
          <SheetTitle className="text-left">Filters</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-13rem)] p-4">
          <div className="space-y-6">
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
                        onClick={() => handleLocalFilterChange("category", "")}>
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
                        onClick={() => handleLocalFilterChange("brand", "")}>
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

            <Accordion
              type="multiple"
              defaultValue={["categories", "brands", "price"]}>
              {/* Categories */}
              <AccordionItem value="categories">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Categories</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <RadioGroup
                    value={localFilters.category}
                    onValueChange={(value) =>
                      handleLocalFilterChange("category", value)
                    }
                    disabled={isPending}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="mobile-category-all" />
                      <Label htmlFor="mobile-category-all" className="text-sm">
                        All Categories
                      </Label>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem
                          value={category.id}
                          id={`mobile-category-${category.id}`}
                        />
                        <Label
                          htmlFor={`mobile-category-${category.id}`}
                          className="text-sm flex-1">
                          {category.name}
                        </Label>
                        {/* <span className="text-xs text-slate-500">
                          ({category.count || 0})
                        </span> */}
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>

              {/* Brands */}
              <AccordionItem value="brands">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Brands</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <RadioGroup
                    value={localFilters.brand}
                    onValueChange={(value) =>
                      handleLocalFilterChange("brand", value)
                    }
                    disabled={isPending}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="mobile-brand-all" />
                      <Label htmlFor="mobile-brand-all" className="text-sm">
                        All Brands
                      </Label>
                    </div>
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem
                          value={brand.id}
                          id={`mobile-brand-${brand.id}`}
                        />
                        <Label
                          htmlFor={`mobile-brand-${brand.id}`}
                          className="text-sm flex-1">
                          {brand.name}
                        </Label>
                        {/* <span className="text-xs text-slate-500">
                          ({brand.count || 0})
                        </span> */}
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>

              {/* Price Range */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Price Range</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 px-1">
                    <Slider
                      value={localFilters.priceRange}
                      onValueChange={(value) =>
                        handleLocalFilterChange(
                          "priceRange",
                          value as [number, number]
                        )
                      }
                      min={0}
                      max={5000}
                      step={50}
                      disabled={isPending}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        Ksh {localFilters.priceRange[0].toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        Ksh {localFilters.priceRange[1].toLocaleString()}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Rating */}
              <AccordionItem value="rating">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Customer Rating</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <RadioGroup
                    value={localFilters.rating}
                    onValueChange={(value) =>
                      handleLocalFilterChange("rating", value)
                    }
                    disabled={isPending}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="mobile-rating-all" />
                      <Label htmlFor="mobile-rating-all" className="text-sm">
                        All Ratings
                      </Label>
                    </div>
                    {ratingOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`mobile-rating-${option.value}`}
                        />
                        <Label
                          htmlFor={`mobile-rating-${option.value}`}
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
                </AccordionContent>
              </AccordionItem>

              {/* Tags */}
              <AccordionItem value="tags">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Product Tags</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-2">
                    {popularTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-tag-${tag.id}`}
                          checked={localFilters.tags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                          disabled={isPending}
                        />
                        <Label
                          htmlFor={`mobile-tag-${tag.id}`}
                          className="text-sm flex-1 cursor-pointer">
                          {tag.label}
                        </Label>
                        <span className="text-xs text-slate-500">
                          ({tag.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Sort Options */}
              <AccordionItem value="sort">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Sort By</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <RadioGroup
                    value={localFilters.sort}
                    onValueChange={(value) =>
                      handleLocalFilterChange("sort", value)
                    }
                    disabled={isPending}>
                    {sortOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`mobile-sort-${option.value}`}
                        />
                        <Label
                          htmlFor={`mobile-sort-${option.value}`}
                          className="text-sm flex-1">
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>

              {/* Availability */}
              <AccordionItem value="availability">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Availability</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mobile-in-stock"
                      checked={localFilters.inStock}
                      onCheckedChange={(checked) =>
                        handleLocalFilterChange("inStock", !!checked)
                      }
                      disabled={isPending}
                    />
                    <Label
                      htmlFor="mobile-in-stock"
                      className="text-sm cursor-pointer">
                      In Stock Only
                    </Label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <SheetFooter className="border-t p-4 flex flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button className="flex-1" onClick={applyFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
