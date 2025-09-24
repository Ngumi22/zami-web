"use client";

import { ProductCardData } from "@/data/fetch-all";
import ProductCard from "../home/card-product";

export default function NewArrivals({
  newArrivals,
}: {
  newArrivals: ProductCardData[];
}) {
  return (
    <div className="md:container flex min-h-screen flex-col my-8">
      <div className="mx-auto mb-8 md:mb-12">
        <h1 className="text-lg md:text-2xl font-semibold">
          Newest Products in Our Catalogue
        </h1>
        <p className="text-muted-foreground text-center">
          Check out our latest products and get them while hot
        </p>
      </div>

      {newArrivals.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">No new arrivals</h2>
          <p className="text-muted-foreground">
            Check back soon for new products.
          </p>
        </div>
      )}
    </div>
  );
}
