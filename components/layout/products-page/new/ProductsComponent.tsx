"use client";

import { useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardData } from "@/data/fetch-all";
import ProductCard from "@/components/home/card-product";

export default function ProductsComponent({
  products,
}: {
  products: ProductCardData[];
}) {
  const [isLoading] = useTransition();

  return (
    <section className="w-full">
      {isLoading ? (
        <ul
          role="list"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <li key={index} className="relative">
              <Skeleton className="aspect-square w-full rounded-lg bg-gray-100" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded" />
              <Skeleton className="mt-1 h-4 w-1/2 rounded" />
              <Skeleton className="mt-1 h-4 w-1/4 rounded" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
