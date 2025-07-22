import type React from "react";

import { ProductCard } from "../admin/product-sections/product-card";
import { Product } from "@prisma/client";

interface ProductGridProps {
  products: Product[];
  viewMode?: "list" | "grid";
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-4">No products found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
