"use client";

import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import type { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SubcategoryFilterProps {
  subcategories: Category[];
}

export default function SubcategoryFilter({
  subcategories,
}: SubcategoryFilterProps) {
  const [currentSubcategories, setSubcategories] = useQueryState(
    "subcategories",
    {
      defaultValue: [],
      shallow: false,
      history: "push",
      parse: (value: string) => value.split(",").filter(Boolean),
      serialize: (value: string[]) => value.join(","),
    }
  );

  const selectedSubcategories = useMemo(
    () => new Set(currentSubcategories),
    [currentSubcategories]
  );

  const handleSubcategoryChange = useCallback(
    (slug: string, isChecked: boolean) => {
      const newSubcategories = new Set(selectedSubcategories);
      if (isChecked) {
        newSubcategories.add(slug);
      } else {
        newSubcategories.delete(slug);
      }
      const newArray = Array.from(newSubcategories);
      setSubcategories(newArray.length > 0 ? newArray : null);
    },
    [selectedSubcategories, setSubcategories]
  );

  const clearAllSubcategories = useCallback(() => {
    setSubcategories(null);
  }, [setSubcategories]);

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-xs p-2 m-0">
      <div className="pb-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold mb-1 text-sm">Subcategories</p>
          {selectedSubcategories.size > 0 && (
            <Button
              onClick={clearAllSubcategories}
              className="text-sm text-muted-foreground hover:text-foreground h-auto p-0"
              variant="ghost">
              Clear All
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {subcategories.map((subcategory) => (
          <div key={subcategory.id} className="flex items-center space-x-2">
            <Checkbox
              id={`subcategory-${subcategory.id}`}
              checked={selectedSubcategories.has(subcategory.slug!)}
              onCheckedChange={(checked) =>
                handleSubcategoryChange(subcategory.slug!, checked as boolean)
              }
              className="h-3 w-3"
            />
            <Label
              htmlFor={`subcategory-${subcategory.id}`}
              className="text-xs font-normal leading-none cursor-pointer">
              {subcategory.name}
            </Label>
          </div>
        ))}
      </div>
    </Card>
  );
}
