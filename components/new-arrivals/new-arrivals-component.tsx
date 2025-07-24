"use client";

import { Product } from "@prisma/client";
import ProductGrid from "../products/product-grid";

export default function NewArrivals({
  newArrivals,
}: {
  newArrivals: Product[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">New Arrivals</h1>
          <p className="text-muted-foreground">
            Check out our latest products and innovations
          </p>
        </div>

        {newArrivals.length > 0 ? (
          <ProductGrid products={newArrivals} viewMode={"grid"} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-4">No new arrivals</h2>
            <p className="text-muted-foreground">
              Check back soon for new products.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
