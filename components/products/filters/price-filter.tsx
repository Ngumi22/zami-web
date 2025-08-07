"use client";

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PriceFilterProps {
  min: number;
  max: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
  onClear?: () => void;
}

const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `Ksh${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
  }
  return `Ksh${price}`;
};

const getStepSize = (maxPrice: number): number => {
  if (maxPrice <= 10000) return 10;
  if (maxPrice <= 50000) return 25;
  if (maxPrice <= 1000000) return 50;
  return 100;
};

const ALL_PRESETS = [
  { label: "Under Ksh 1k", max: 1000 },
  { label: "Under Ksh 4k", max: 4000 },
  { label: "Under Ksh 5k", max: 5000 },
  { label: "Under Ksh 10k", max: 10000 },
  { label: "Ksh 10k-20k", min: 10000, max: 20000 },
  { label: "Ksh 20k-30k", min: 20000, max: 30000 },
  { label: "Ksh 30k-40k", min: 30000, max: 40000 },
  { label: "Ksh 40k-50k", min: 40000, max: 50000 },
  { label: "Over Ksh 50k", min: 50000 },
  { label: "Over Ksh 100k", min: 100000 },
];

export const PriceFilter = memo(
  function PriceFilter({
    min,
    max,
    maxPrice,
    onChange,
    onClear,
  }: PriceFilterProps) {
    // When max is Infinity (no filter), slider should go up to maxPrice
    const initialMax = max === Infinity ? maxPrice : max;
    const [localValues, setLocalValues] = useState<[number, number]>([
      min,
      initialMax,
    ]);

    useEffect(() => {
      const newMax = max === Infinity ? maxPrice : max;
      setLocalValues([min, newMax]);
    }, [min, max, maxPrice]);

    const stepSize = useMemo(() => getStepSize(maxPrice), [maxPrice]);

    const handleValueChange = useCallback((values: number[]) => {
      setLocalValues([values[0], values[1]]);
    }, []);

    const handleValueCommit = useCallback(
      (values: number[]) => {
        onChange(values[0], values[1]);
      },
      [onChange]
    );

    const handlePresetClick = useCallback(
      (preset: { min?: number; max?: number }) => {
        const newMin = preset.min ?? 0;
        const newMax = preset.max ?? maxPrice;
        setLocalValues([newMin, newMax]);
        onChange(newMin, newMax);
      },
      [maxPrice, onChange]
    );

    const handleClear = useCallback(() => {
      const newValues: [number, number] = [0, maxPrice];
      setLocalValues(newValues);
      // If onClear is provided, it should handle the state update.
      // Otherwise, call onChange with the default unfiltered values.
      if (onClear) {
        onClear();
      } else {
        onChange(...newValues);
      }
    }, [maxPrice, onChange, onClear]);

    // Always show presets based on maxPrice of the category,
    // not on current min/max filter values.
    const filteredPresets = useMemo(() => {
      return ALL_PRESETS.filter((preset) => {
        const presetMax = preset.max ?? Infinity;
        return presetMax <= maxPrice;
      }).slice(0, 6); // limit to top 6
    }, [maxPrice]);

    const [localMin, localMax] = localValues;
    const hasActiveFilter = localMin > 0 || localMax < maxPrice;

    return (
      <div className="space-y-3">
        {hasActiveFilter && (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              aria-label="Clear price filter">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="px-3">
          <Slider
            value={localValues}
            onValueChange={handleValueChange}
            onValueCommit={handleValueCommit}
            max={maxPrice}
            min={0}
            step={stepSize}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-3 font-medium">
            <span>{formatPrice(localMin)}</span>
            <span>{formatPrice(localMax)}</span>
          </div>
        </div>

        {filteredPresets.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-3">Quick Select</div>
            <div className="flex flex-wrap gap-2">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    (preset.min ?? 0) === localMin &&
                    (preset.max ?? maxPrice) === localMax
                      ? "bg-black text-white border-transparent"
                      : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                  }`}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.min === next.min &&
    prev.max === next.max &&
    prev.maxPrice === next.maxPrice
);
