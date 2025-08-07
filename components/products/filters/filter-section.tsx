"use client";

import { memo, useCallback } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface FilterSectionProps {
  id: string;
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onClear?: () => void;
  showCounts?: boolean;
}

export const FilterSection = memo(function FilterSection({
  id,
  title,
  options,
  selectedValues,
  onChange,
  onClear,
  showCounts = false,
}: FilterSectionProps) {
  const handleCheckboxChange = useCallback(
    (optionId: string, checked: boolean) => {
      let newValues: string[];
      if (checked) {
        newValues = [...selectedValues, optionId];
      } else {
        newValues = selectedValues.filter((val) => val !== optionId);
      }
      onChange(newValues);
    },
    [selectedValues, onChange]
  );

  const handleRemoveOption = useCallback(
    (optionId: string) => {
      const newValues = selectedValues.filter((val) => val !== optionId);
      onChange(newValues);
    },
    [selectedValues, onChange]
  );

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    } else {
      onChange([]);
    }
  }, [onClear, onChange]);

  return (
    <AccordionItem value={id} className="text-xs">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full mr-4">
          <span>{title}</span>

          <div className="flex items-center gap-2">
            <span className="p-2">
              {selectedValues.length > 0 && (
                <span className="p-2">({selectedValues.length})</span>
              )}
            </span>
            {selectedValues.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="flex justify-center items-center h-6 w-6 p-0"
                role="button"
                aria-label={`Clear ${title} filters`}>
                <X className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="">
        <div className="space-y-2">
          {options.map((option) => {
            const isChecked = selectedValues.includes(option.id);

            return (
              <div
                key={option.id}
                className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${option.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(option.id, checked as boolean)
                    }
                    className="border-gray-600 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                  />
                  <Label
                    htmlFor={`${id}-${option.id}`}
                    className="text-xs cursor-pointer">
                    {option.name}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  {isChecked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.id);
                      }}
                      aria-label={`Remove ${option.name}`}
                      className="flex justify-center items-center h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {showCounts && (
                    <span className="text-xs">({option.count ?? 0})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});
