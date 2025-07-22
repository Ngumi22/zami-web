"use client";
import { Product } from "@prisma/client/edge";
import { PromotionalBanner } from "../home/promotional-banner";
import ProductGrid from "../products/product-grid";

export default function Deals({ productDeals }: { productDeals: Product[] }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <PromotionalBanner
          title="Limited Time Offers"
          description="Save big on our best-selling electronics. Hurry, these deals won't last long!"
          ctaText="Shop All Deals"
          ctaLink="#deals-section"
          imageSrc="/placeholder.svg"
          imageAlt="Special Deals"
          variant="primary"
          size="large"
        />

        <div className="mt-12" id="deals-section">
          <h1 className="text-3xl font-bold mb-6">Current Deals</h1>

          {productDeals.length > 0 ? (
            <ProductGrid products={productDeals} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-4">No deals available</h2>
              <p className="text-muted-foreground">
                Check back soon for new deals and promotions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
