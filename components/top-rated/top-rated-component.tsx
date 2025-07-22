"use client";

import { Product } from "@prisma/client";
import ProductGrid from "../products/product-grid";

export default function TopRatedComponent({
  topRated,
}: {
  topRated: Product[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Top Rated Products</h1>
          <p className="text-muted-foreground">
            Our most loved and highest rated items
          </p>
        </div>

        {topRated.length > 0 ? (
          <ProductGrid products={topRated} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-4">No products rated yet</h2>
            <p className="text-muted-foreground">Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
