"use client";

import { Card, CardContent } from "@/components/ui/card";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { ProductCardData } from "@/data/product";
import ProductCard from "../home/card-product";

interface ProductGridProps {
  products: ProductCardData[];
  viewMode: 1 | 2 | 3 | 4 | 5;
  isLoading: boolean;
}

const ProductGrid = memo(function ProductGrid({
  products,
  viewMode,
  isLoading,
}: ProductGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-4", gridCols[viewMode])}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">No products found</div>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[viewMode])}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});

export default ProductGrid;
