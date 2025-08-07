import { memo } from "react";
import { ProductCard } from "@/components/admin/product-sections/product-card";
import { Product } from "@prisma/client";

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = memo(function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 text-sm mb-1">No products found</div>
        <div className="text-gray-500 text-xs">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});
