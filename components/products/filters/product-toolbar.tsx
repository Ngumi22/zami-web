"use client";

import { memo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductToolbarProps {
  totalProducts: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
  showingCount?: number;
}

export const ProductToolbar = memo(function ProductToolbar({
  totalProducts,
  currentSort,
  onSortChange,
  showingCount,
}: ProductToolbarProps) {
  const handleSortChange = useCallback(
    (value: string) => {
      onSortChange(value);
    },
    [onSortChange]
  );

  return (
    <div className="flex items-center justify-between gap-6 mb-6">
      <div className="text-xs text-black">
        {showingCount !== undefined ? (
          <>
            Showing {showingCount} of {totalProducts}{" "}
            {totalProducts === 1 ? "product" : "products"}
          </>
        ) : (
          <>
            {totalProducts} {totalProducts === 1 ? "product" : "products"} found
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-black">Sort by:</span>
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Best Rating</SelectItem>
            <SelectItem value="low">Price: Low to High</SelectItem>
            <SelectItem value="high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
