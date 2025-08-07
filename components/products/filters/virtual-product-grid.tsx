"use client";

import { memo, useCallback, useRef } from "react";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { ProductWithDetails } from "@/data/product-page-product";
import { ProductCard } from "@/components/admin/product-sections/product-card";

interface VirtualProductGridProps {
  products: ProductWithDetails[];
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const VirtualProductGrid = memo(function VirtualProductGrid({
  products,
  hasNextPage,
  isLoading,
  onLoadMore,
}: VirtualProductGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(
    loadMoreRef,
    useCallback(() => {
      if (hasNextPage && !isLoading) {
        onLoadMore();
      }
    }, [hasNextPage, isLoading, onLoadMore]),
    { threshold: 0.1, rootMargin: "100px" }
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center my-auto text-center">
        <div className="text-gray-400 text-lg mb-2">No products found</div>
        <div className="text-gray-500 text-sm">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              slug: product.slug ?? "",
              shortDescription: product.shortDescription ?? "",
              description: product.description ?? "",
              originalPrice: product.price ?? null,
              mainImage: product.image ?? "",
              thumbnailImages: product.thumbnailImages ?? [],
              stock: product.stock ?? 0,
              price: product.price ?? 0,
              name: product.name ?? "",
              variants: product.variants ?? [],
              featured: product.featured ?? false,
              tags: product.tags ?? [],
              averageRating: product.rating ?? 0,
              reviewCount: product.reviewCount ?? 0,
              createdAt: product.createdAt ?? "",
              updatedAt: product.updatedAt ?? "",
              sales: product.sales ?? 0,
              specifications: product.specifications ?? {},
            }}
          />
        ))}
      </div>

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoading ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span>Loading more products...</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              Scroll for more products
            </div>
          )}
        </div>
      )}

      {!hasNextPage && products.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">
            You've seen all {products.length} products
          </div>
        </div>
      )}
    </div>
  );
});
