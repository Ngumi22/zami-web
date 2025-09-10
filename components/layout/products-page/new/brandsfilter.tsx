"use client";

import { useState, useCallback } from "react";
import { useQueryStates } from "nuqs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BrandFilterProps {
  brands: string[];
}

export default function BrandFilter({ brands }: BrandFilterProps) {
  const [showAll, setShowAll] = useState(false);

  const [queryStates, setQueryStates] = useQueryStates({
    brands: {
      type: "string",
      defaultValue: [],
      shallow: false,
      history: "push",
      parse: (value: string) => value.split(",").filter(Boolean),
      serialize: (value: string[]) => value.join(","),
    },
  });

  const currentBrands = queryStates.brands;

  const handleBrandChange = useCallback(
    (brand: string, checked: boolean) => {
      let newBrands: string[];

      if (checked) {
        newBrands = [...new Set([...currentBrands, brand])];
      } else {
        newBrands = currentBrands.filter((b: string) => b !== brand);
      }
      setQueryStates({ brands: newBrands.length > 0 ? newBrands : null });
    },
    [currentBrands, setQueryStates]
  );

  const clearFilters = useCallback(() => {
    setQueryStates({ brands: null });
  }, [setQueryStates]);

  if (brands.length === 0) {
    return null;
  }

  const shouldShowToggle = brands.length > 5;
  const visibleBrands =
    shouldShowToggle && !showAll ? brands.slice(0, 5) : brands;
  const hiddenCount = shouldShowToggle ? brands.length - 5 : 0;

  return (
    <Card className="rounded-xs p-2 m-0">
      <div className="pb-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold mb-1 text-sm">Brands</p>
          {currentBrands.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {visibleBrands.map((brand) => (
          <div key={brand} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand}`}
              checked={currentBrands.includes(brand)}
              onCheckedChange={(checked) =>
                handleBrandChange(brand, checked as boolean)
              }
              className="h-3 w-3"
            />
            <Label
              htmlFor={`brand-${brand}`}
              className="text-xs font-normal leading-none cursor-pointer">
              {brand}
            </Label>
          </div>
        ))}

        {shouldShowToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full justify-center text-xs text-muted-foreground hover:text-foreground mt-3">
            {showAll ? (
              <>
                Show less <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Show {hiddenCount} more <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
