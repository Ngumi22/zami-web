"use client";

import { useMemo } from "react";
import { ProductGrid } from "./product-grid";
import { Category, Product } from "@prisma/client";

interface FilteredProductGridProps {
  products: Product[];
  categories: Category[];
  totalProducts: number;
  filters: {
    category?: Category;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string | string[];
    search?: string;
  };
}

export function FilteredProductGrid({
  filters,
  products,
  totalProducts,
}: FilteredProductGridProps) {
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    switch (filters.sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "createdAt-desc":
      default:
        break;
    }

    return filtered;
  }, [products, filters.sort]);

  if (filteredAndSortedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or browse our other collections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedProducts.length} of {totalProducts} products
        </p>
      </div>

      <ProductGrid products={filteredAndSortedProducts} />
    </div>
  );
}
