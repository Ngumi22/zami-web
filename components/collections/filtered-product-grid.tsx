"use client";

import { useMemo } from "react";
import { ProductGrid } from "./product-grid";
import { Category, Product } from "@prisma/client";

interface FilteredProductGridProps {
  products: Product[];
  categories: Category[];
  filters: {
    category?: Category;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export function FilteredProductGrid({
  filters,
  products,
}: FilteredProductGridProps) {
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.categoryId === filters.category!.id
      );
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.price <= filters.maxPrice!
      );
    }

    // Apply sorting
    switch (filters.sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "rating":
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "featured":
      default:
        break;
    }

    return filtered;
  }, [products, filters]);

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
          Showing {filteredAndSortedProducts.length} of {products.length}{" "}
          products
        </p>
      </div>

      <ProductGrid products={filteredAndSortedProducts} />
    </div>
  );
}
