"use client";

import { useQueryState } from "nuqs";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";

interface PriceFilterProps {
  maxPrice: number;
  minPrice: number;
  currentMin?: number;
  currentMax?: number;
}

const usePriceRanges = (minPrice: number, maxPrice: number) => {
  return useMemo(() => {
    const ranges = [{ label: "All prices", value: "all" }];

    if (maxPrice <= 0) return ranges;

    const rangeCount = Math.min(4, Math.max(2, Math.ceil(maxPrice / 2500)));
    const step = Math.ceil(maxPrice / rangeCount);

    const roundedStep = Math.ceil(step / 500) * 500;

    for (let i = 0; i < rangeCount; i++) {
      const rangeStart = i * roundedStep;
      const rangeEnd = i === rangeCount - 1 ? maxPrice : (i + 1) * roundedStep;

      if (rangeStart < maxPrice) {
        if (i === 0) {
          ranges.push({
            label: `Under Ksh${rangeEnd.toLocaleString()}`,
            value: `0-${rangeEnd}`,
          });
        } else {
          ranges.push({
            label: `Ksh${rangeStart.toLocaleString()} - Ksh${rangeEnd.toLocaleString()}`,
            value: `${rangeStart}-${rangeEnd}`,
          });
        }
      }
    }

    return ranges.filter((range) => {
      if (range.value === "all") return true;
      const [min] = range.value.split("-").map(Number);
      return min < maxPrice;
    });
  }, [minPrice, maxPrice]);
};

export default function PriceFilter({
  maxPrice,
  minPrice,
  currentMin,
  currentMax,
}: PriceFilterProps) {
  const [priceMin, setPriceMin] = useQueryState("priceMin", {
    defaultValue: currentMin?.toString() || "",
    shallow: false,
    clearOnDefault: true,
  });

  const [priceMax, setPriceState] = useQueryState("priceMax", {
    defaultValue: currentMax?.toString() || "",
    shallow: false,
    clearOnDefault: true,
  });

  const [showCustomSlider, setShowCustomSlider] = useState(false);
  const [sliderValues, setSliderValues] = useState<number[]>(() => {
    const minVal = currentMin || minPrice;
    const maxVal = currentMax || maxPrice;
    return [minVal, maxVal];
  });

  const predefinedRanges = usePriceRanges(minPrice, maxPrice);

  const handleRangeSelect = useCallback(
    (value: string) => {
      if (value === "all") {
        setPriceMin(null);
        setPriceState(null);
        setShowCustomSlider(false);
      } else if (value === "custom") {
        setShowCustomSlider(true);
        setSliderValues([minPrice, maxPrice]);
      } else {
        const [min, max] = value.split("-").map(Number);
        setPriceMin(min.toString());
        setPriceState(max.toString());
        setShowCustomSlider(false);
      }
    },
    [minPrice, maxPrice, setPriceMin, setPriceState]
  );

  const handleSliderChange = useCallback((values: number[]) => {
    setSliderValues(values);
  }, []);

  const handleSliderCommit = useCallback(
    (values: number[]) => {
      setPriceMin(values[0] === minPrice ? null : values[0].toString());
      setPriceState(values[1] === maxPrice ? null : values[1].toString());
    },
    [minPrice, maxPrice, setPriceMin, setPriceState]
  );

  const clearFilters = useCallback(() => {
    setPriceMin(null);
    setPriceState(null);
    setShowCustomSlider(false);
    setSliderValues([minPrice, maxPrice]);
  }, [minPrice, maxPrice, setPriceMin, setPriceState]);

  const isCustomRange = useMemo(() => {
    return !predefinedRanges.some((range) => {
      if (range.value === "all") return !priceMin && !priceMax;

      const [rangeMin, rangeMax] = range.value.split("-").map(Number);
      return (
        Number.parseInt(priceMin || "0") === rangeMin &&
        Number.parseInt(priceMax || maxPrice.toString()) === rangeMax
      );
    });
  }, [predefinedRanges, priceMin, priceMax, maxPrice]);

  const shouldShowSlider = useMemo(
    () => showCustomSlider || (isCustomRange && (!!priceMin || !!priceMax)),
    [showCustomSlider, isCustomRange, priceMin, priceMax]
  );

  const getCurrentValue = useCallback(() => {
    if (!priceMin && !priceMax) return "all";
    if (shouldShowSlider) return "custom";

    const matchingRange = predefinedRanges.find((range) => {
      if (range.value === "all") return false;
      const [rangeMin, rangeMax] = range.value.split("-").map(Number);
      return (
        Number.parseInt(priceMin || "0") === rangeMin &&
        Number.parseInt(priceMax || maxPrice.toString()) === rangeMax
      );
    });

    return matchingRange?.value || "custom";
  }, [predefinedRanges, priceMin, priceMax, maxPrice, shouldShowSlider]);

  if (maxPrice <= 0) return null;

  return (
    <Card className="rounded-xs p-2 m-0">
      <div className="pb-1 text-xs">
        <div className="flex justify-between items-center">
          <p className="font-semibold mb-1 text-sm">Price</p>
          {(priceMin || priceMax) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <RadioGroup
          value={getCurrentValue()}
          onValueChange={handleRangeSelect}
          className="space-y-1">
          {predefinedRanges.map((range) => (
            <div key={range.value} className="flex items-center space-x-1">
              <RadioGroupItem value={range.value} id={range.value} />
              <Label htmlFor={range.value} className="cursor-pointer text-xs">
                {range.label}
              </Label>
            </div>
          ))}

          <div className="flex items-center space-x-1">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="cursor-pointer text-xs">
              Custom
            </Label>
          </div>
        </RadioGroup>

        {shouldShowSlider && (
          <div className="space-y-2 pt-2">
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: Ksh{sliderValues[0].toLocaleString()}</span>
              <span>Max: Ksh{sliderValues[1].toLocaleString()}</span>
            </div>
            <Slider
              min={minPrice}
              max={maxPrice}
              step={100}
              value={sliderValues}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              className="w-full"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
