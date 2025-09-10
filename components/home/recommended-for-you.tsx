"use client";

import type { Product } from "@prisma/client";
import { ProductCard } from "../admin/product-sections/product-card";

interface RecommendedForYouProps {
  products: Product[];
}

export function RecommendedForYou({ products }: RecommendedForYouProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Recommended For You
          </h2>
          <p className="text-muted-foreground">
            Picked just for you based on your activity.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
