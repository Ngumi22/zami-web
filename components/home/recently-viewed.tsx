"use client";

import { useState, useEffect } from "react";

import { ProductCarousel, ProductCarouselItem } from "./product-carousel";
import { ProductCardData } from "@/data/fetch-all";
import ProductCard from "./card-product";

const useRecentlyViewed = () => {
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    const storedIds = localStorage.getItem("recentlyViewed");
    if (storedIds) {
      setProductIds(JSON.parse(storedIds));
    }
  }, []);

  return productIds;
};

interface RecentlyViewedProps {
  allProducts: ProductCardData[];
}

export function RecentlyViewed({ allProducts }: RecentlyViewedProps) {
  const viewedProductIds = useRecentlyViewed();

  const viewedProducts = allProducts.filter((product) =>
    viewedProductIds.includes(product.id)
  );

  const orderedViewedProducts = viewedProductIds
    .map((id) => viewedProducts.find((p) => p.id === id))
    .filter((p): p is ProductCardData => p !== undefined);

  if (orderedViewedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <ProductCarousel title="👀 Recently Viewed" viewAllHref="/products">
        {orderedViewedProducts.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}
