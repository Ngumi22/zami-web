"use client";

import { memo, useCallback, useMemo } from "react";

interface PriceQuickSelectProps {
  min: number;
  max: number;
  categoryMaxPrice: number; // ONLY this max price is used
  onChange: (min: number, max: number) => void;
}

const ALL_PRESETS = [
  { label: "Under Ksh 1k", max: 1000 },
  { label: "Under Ksh 3k", max: 3000 },
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

export const PriceQuickSelect = memo(
  function PriceQuickSelect({
    min,
    max,
    categoryMaxPrice,
    onChange,
  }: PriceQuickSelectProps) {
    const handlePresetClick = useCallback(
      (preset: { min?: number; max?: number }) => {
        const newMin = preset.min ?? 0;
        const newMax = Math.min(preset.max ?? Infinity, categoryMaxPrice);
        onChange(newMin, newMax);
      },
      [categoryMaxPrice, onChange]
    );

    const visiblePresets = useMemo(() => {
      return ALL_PRESETS.filter((preset) => {
        const presetMax = preset.max ?? Infinity;
        return presetMax <= categoryMaxPrice;
      });
    }, [categoryMaxPrice]);

    return (
      <div>
        <div className="text-xs text-gray-400 mb-3">Quick Select</div>
        <div className="flex flex-wrap gap-2">
          {visiblePresets.map((preset) => {
            const isSelected =
              (preset.min ?? 0) === min &&
              (preset.max ?? categoryMaxPrice) === max;

            return (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  isSelected
                    ? "bg-blue-500 text-white border-transparent"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}>
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.min === next.min &&
    prev.max === next.max &&
    prev.categoryMaxPrice === next.categoryMaxPrice
);
