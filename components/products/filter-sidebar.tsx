"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { ProductFilters, ProductsResponse } from "@/data/product-filters";

interface FilterSidebarProps {
  filters: ProductFilters;
  facets: ProductsResponse["facets"];
  priceRange: { min: number; max: number };
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onClearFilters: () => void;
}

const FilterSidebar = React.memo(function FilterSidebar({
  filters,
  facets,
  priceRange,
  onFiltersChange,
  onPriceRangeChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [minPriceInput, setMinPriceInput] = useState(priceRange.min.toString());
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange.max.toString());

  // Sync local price inputs with external price range changes
  useEffect(() => {
    setMinPriceInput(priceRange.min.toString());
    setMaxPriceInput(priceRange.max.toString());
  }, [priceRange.min, priceRange.max]);

  const handlePriceSliderChange = useCallback(
    (values: number[]) => {
      onPriceRangeChange(values[0], values[1]);
    },
    [onPriceRangeChange]
  );

  const handleMinPriceInputChange = useCallback(
    (value: string) => {
      setMinPriceInput(value);
      const numValue = Number(value);
      if (
        !isNaN(numValue) &&
        numValue >= facets.priceRange.min &&
        numValue <= priceRange.max
      ) {
        onPriceRangeChange(numValue, priceRange.max);
      }
    },
    [facets.priceRange.min, priceRange.max, onPriceRangeChange]
  );

  const handleMaxPriceInputChange = useCallback(
    (value: string) => {
      setMaxPriceInput(value);
      const numValue = Number(value);
      if (
        !isNaN(numValue) &&
        numValue <= facets.priceRange.max &&
        numValue >= priceRange.min
      ) {
        onPriceRangeChange(priceRange.min, numValue);
      }
    },
    [facets.priceRange.max, priceRange.min, onPriceRangeChange]
  );

  const handleCategoryChange = useCallback(
    (categorySlug: string, checked: boolean) => {
      onFiltersChange({
        category: checked ? categorySlug : undefined,
      });
    },
    [onFiltersChange]
  );

  const handleBrandChange = useCallback(
    (brandSlug: string, checked: boolean) => {
      onFiltersChange({
        brand: checked ? brandSlug : undefined,
      });
    },
    [onFiltersChange]
  );

  const handleTagChange = useCallback(
    (tag: string, checked: boolean) => {
      const currentTags = filters.tags || [];
      const newTags = checked
        ? [...currentTags, tag]
        : currentTags.filter((t) => t !== tag);

      onFiltersChange({
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [filters.tags, onFiltersChange]
  );

  const handleSpecificationChange = useCallback(
    (specName: string, value: string, checked: boolean) => {
      const currentSpecs = filters.specifications || {};
      const newSpecs = { ...currentSpecs };

      if (checked) {
        newSpecs[specName] = value;
      } else {
        delete newSpecs[specName];
      }

      onFiltersChange({
        specifications: Object.keys(newSpecs).length > 0 ? newSpecs : undefined,
      });
    },
    [filters.specifications, onFiltersChange]
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.specifications)
      count += Object.keys(filters.specifications).length;
    if (filters.featured !== undefined) count++;
    if (filters.stock !== undefined) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Price Range
          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={[priceRange.min, priceRange.max]}
              onValueChange={handlePriceSliderChange}
              max={facets.priceRange.max}
              min={facets.priceRange.min}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label
                htmlFor="min-price"
                className="text-xs text-muted-foreground">
                Min
              </Label>
              <Input
                id="min-price"
                type="number"
                value={minPriceInput}
                onChange={(e) => handleMinPriceInputChange(e.target.value)}
                className="h-8 text-xs transition-all duration-200"
                min={facets.priceRange.min}
                max={facets.priceRange.max}
              />
            </div>
            <div className="flex-1">
              <Label
                htmlFor="max-price"
                className="text-xs text-muted-foreground">
                Max
              </Label>
              <Input
                id="max-price"
                type="number"
                value={maxPriceInput}
                onChange={(e) => handleMaxPriceInputChange(e.target.value)}
                className="h-8 text-xs transition-all duration-200"
                min={facets.priceRange.min}
                max={facets.priceRange.max}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      {facets.categories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Categories
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {facets.categories.slice(0, 8).map((category) => (
              <div
                key={category.slug}
                className="flex items-center space-x-2 transition-all duration-150 hover:bg-muted/50 rounded p-1">
                <Checkbox
                  id={`category-${category.slug}`}
                  checked={filters.category === category.slug}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.slug, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category.slug}`}
                  className="text-xs flex-1 cursor-pointer">
                  {category.name}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {category.count}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Brands */}
      {facets.brands.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Brands
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {facets.brands.slice(0, 8).map((brand) => (
              <div
                key={brand.slug}
                className="flex items-center space-x-2 transition-all duration-150 hover:bg-muted/50 rounded p-1">
                <Checkbox
                  id={`brand-${brand.slug}`}
                  checked={filters.brand === brand.slug}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.slug, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`brand-${brand.slug}`}
                  className="text-xs flex-1 cursor-pointer">
                  {brand.name}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {brand.count}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Specifications */}
      {facets.specifications.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Specifications
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {facets.specifications.slice(0, 5).map((spec) => (
              <div key={spec.name} className="space-y-2">
                <Label className="text-xs font-medium">{spec.name}</Label>
                <div className="space-y-1">
                  {spec.values.slice(0, 4).map((value) => {
                    // Normalize both the filter value and the current value for comparison
                    const normalizeValue = (val: string) =>
                      val.toLowerCase().trim();
                    const currentSpecValue =
                      filters.specifications?.[spec.name];
                    const isChecked =
                      currentSpecValue &&
                      normalizeValue(currentSpecValue) ===
                        normalizeValue(value);

                    console.log(
                      `Spec check: ${spec.name} - Filter: "${currentSpecValue}" vs Value: "${value}" = ${isChecked}`
                    ); // Debug log

                    return (
                      <div
                        key={`${spec.name}-${value}`}
                        className="flex items-center space-x-2 transition-all duration-150 hover:bg-muted/50 rounded p-1">
                        <Checkbox
                          id={`spec-${spec.name}-${value}`}
                          checked={!!isChecked}
                          onCheckedChange={(checked) =>
                            handleSpecificationChange(
                              spec.name,
                              value,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`spec-${spec.name}-${value}`}
                          className="text-xs cursor-pointer">
                          {value}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Tags */}
      {facets.tags.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Tags
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {facets.tags.slice(0, 12).map((tag) => (
                <Badge
                  key={tag.name}
                  variant={
                    filters.tags?.includes(tag.name) ? "default" : "outline"
                  }
                  className="cursor-pointer text-xs transition-all duration-200 hover:scale-105"
                  onClick={() =>
                    handleTagChange(tag.name, !filters.tags?.includes(tag.name))
                  }>
                  {tag.name}
                  <span className="ml-1 text-xs">({tag.count})</span>
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Featured */}
      <div className="flex items-center space-x-2 transition-all duration-150 hover:bg-muted/50 rounded p-2">
        <Checkbox
          id="featured"
          checked={filters.featured === true}
          onCheckedChange={(checked) =>
            onFiltersChange({ featured: checked ? true : undefined })
          }
        />
        <Label htmlFor="featured" className="text-sm cursor-pointer">
          Featured products only
        </Label>
      </div>

      {/* In Stock */}
      <div className="flex items-center space-x-2 transition-all duration-150 hover:bg-muted/50 rounded p-2">
        <Checkbox
          id="in-stock"
          checked={filters.stock !== undefined && filters.stock > 0}
          onCheckedChange={(checked) =>
            onFiltersChange({ stock: checked ? 1 : undefined })
          }
        />
        <Label htmlFor="in-stock" className="text-sm cursor-pointer">
          In stock only
        </Label>
      </div>
    </div>
  );
});

export default FilterSidebar;
