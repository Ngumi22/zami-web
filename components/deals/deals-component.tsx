"use client";
import { Product } from "@prisma/client/edge";
import { ProductCard } from "../admin/product-sections/product-card";

export default function Deals({ productDeals }: { productDeals: Product[] }) {
  return (
    <div
      className="flex min-h-screen flex-col container px-4 py-8 md:px-6 md:py-12"
      id="deals-section">
      <div className="mx-auto mb-8 md:mb-12">
        <h1 className="text-lg md:text-2xl font-semibold">
          Best Deals in Our Catalogue
        </h1>
        <p className="text-muted-foreground text-center">
          Check out the best deals in Kenya
        </p>
      </div>

      {productDeals.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {productDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">No deals available</h2>
          <p className="text-muted-foreground">
            Check back soon for new deals and promotions.
          </p>
        </div>
      )}
    </div>
  );
}
