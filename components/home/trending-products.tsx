"use client";

import type { Product } from "@prisma/client";
import { ProductCarousel, ProductCarouselItem } from "./product-carousel";
import { ProductCard } from "../admin/product-sections/product-card";

interface TrendingProductsProps {
  products: Product[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <ProductCarousel title="Trending Now 🔥" viewAllHref="/products">
        {products.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}
