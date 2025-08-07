"use client";

import { memo, useMemo, useCallback } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FilterSection } from "./filter-section";
import { PriceFilter } from "./price-filter";
import { BrandWithProductCount, OutputCategory } from "@/data/cat";

interface FiltersSidebarProps {
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

export const FiltersSidebar = memo(
  function FiltersSidebar({
    categories,
    brands,
    currentCategory,
    selectedSubcategories,
    selectedBrands,
    priceMin,
    priceMax,
    maxPrice,
    selectedSpecs,
    onSubcategoriesChange,
    onBrandsChange,
    onPriceChange,
    onSpecsChange,
    onClearAll,
  }: FiltersSidebarProps) {
    const subcategories = useMemo(
      () => categories.filter((cat) => cat.parentId === currentCategory.id),
      [categories, currentCategory.id]
    );

    const specificationSections = useMemo(() => {
      return currentCategory.specifications
        .filter(
          (
            spec
          ): spec is {
            type: "checkbox";
            key: string;
            name: string;
            values: string[];
          } => spec.type === "checkbox" && Array.isArray(spec.values)
        )
        .map((spec) => {
          const selectedValues = selectedSpecs[spec.key] || [];
          return {
            key: spec.key,
            title: spec.name,
            options: spec.values.map((value) => ({
              id: value,
              name: value,
            })),
            selectedValues,
          };
        });
    }, [currentCategory.specifications, selectedSpecs]);

    const handleSpecChange = useCallback(
      (specKey: string, values: string[]) => {
        const newSpecs = { ...selectedSpecs };
        if (values.length === 0) {
          delete newSpecs[specKey];
        } else {
          newSpecs[specKey] = values;
        }
        onSpecsChange(newSpecs);
      },
      [selectedSpecs, onSpecsChange]
    );

    const handleSpecClear = useCallback(
      (specKey: string) => {
        const newSpecs = { ...selectedSpecs };
        delete newSpecs[specKey];
        onSpecsChange(newSpecs);
      },
      [selectedSpecs, onSpecsChange]
    );

    const handleSubcategoriesChange = useCallback(
      (values: string[]) => {
        onSubcategoriesChange(values);
      },
      [onSubcategoriesChange]
    );

    const handleSubcategoriesClear = useCallback(() => {
      onSubcategoriesChange([]);
    }, [onSubcategoriesChange]);

    const handleBrandsChange = useCallback(
      (values: string[]) => {
        onBrandsChange(values);
      },
      [onBrandsChange]
    );

    const handleBrandsClear = useCallback(() => {
      onBrandsChange([]);
    }, [onBrandsChange]);

    const handlePriceChange = useCallback(
      (min: number, max: number) => {
        onPriceChange(min, max);
      },
      [onPriceChange]
    );

    const handlePriceClear = useCallback(() => {
      onPriceChange(0, maxPrice);
    }, [onPriceChange, maxPrice]);

    const handleClearAll = useCallback(() => {
      onClearAll();
    }, [onClearAll]);

    return (
      <div className="w-full rounded-lg h-fit">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="">
            Clear all
          </Button>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["price", "brands", "subcategories"]}
          className="space-y-2">
          <div className="">
            <div className="">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Price</h3>
                <span className="text-xs text-gray-400">
                  Max:{" "}
                  {maxPrice >= 1000
                    ? `Ksh ${(maxPrice / 1000).toFixed(1)}k`
                    : `Ksh ${maxPrice}`}
                </span>
              </div>
            </div>
            <div className="p-2">
              <PriceFilter
                min={priceMin}
                max={priceMax}
                maxPrice={maxPrice}
                onChange={handlePriceChange}
                onClear={handlePriceClear}
              />
            </div>
          </div>

          {/* Subcategories Section */}
          {subcategories.length > 0 && (
            <FilterSection
              id="subcategories"
              title="Categories"
              options={subcategories.map((c) => ({ id: c.slug, name: c.name }))}
              selectedValues={selectedSubcategories}
              onChange={handleSubcategoriesChange}
              onClear={handleSubcategoriesClear}
            />
          )}

          {/* Brands Section */}
          <FilterSection
            id="brands"
            title="Brands"
            options={brands.map((b) => ({
              id: b.slug,
              name: b.name,
              count: b.productCount,
            }))}
            selectedValues={selectedBrands}
            onChange={handleBrandsChange}
            onClear={handleBrandsClear}
            showCounts
          />

          {specificationSections.map((spec) => (
            <FilterSection
              key={spec.key}
              id={spec.key}
              title={spec.title}
              options={spec.options}
              selectedValues={spec.selectedValues}
              onChange={(values) => handleSpecChange(spec.key, values)}
              onClear={() => handleSpecClear(spec.key)}
            />
          ))}
        </Accordion>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const isEqual =
      prevProps.currentCategory.id === nextProps.currentCategory.id &&
      prevProps.priceMin === nextProps.priceMin &&
      prevProps.priceMax === nextProps.priceMax &&
      prevProps.maxPrice === nextProps.maxPrice &&
      prevProps.selectedSubcategories.length ===
        nextProps.selectedSubcategories.length &&
      prevProps.selectedBrands.length === nextProps.selectedBrands.length &&
      JSON.stringify(prevProps.selectedSpecs) ===
        JSON.stringify(nextProps.selectedSpecs);
    return isEqual;
  }
);
