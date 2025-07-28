"use client";

import { useHomepageData } from "@/lib/hooks";
import HeroSection from "@/components/home/hero-section";
import { PromotionalBanner } from "@/components/home/promotional-banner";
import {
  CategoryProductsSection,
  FeaturedProductsSection,
  SpecialOfferCarousel,
  NewestProductsSection,
  PromotionalSection,
  CategoriesSection,
} from "@/components/home/product-sections";
import { Key } from "react";

export default function HomePage() {
  const [
    { data: products, isLoading: productsLoading },
    { data: featuredProducts, isLoading: featuredLoading },
    { data: newProducts, isLoading: newProductsLoading },
    { data: categories, isLoading: categoriesLoading },
  ] = useHomepageData();

  const isLoading =
    productsLoading ||
    featuredLoading ||
    newProductsLoading ||
    categoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <HeroSection />
          <div className="container px-4 md:px-6">
            {/* Render skeleton loaders */}
            <PromotionalSection />
          </div>
        </main>
      </div>
    );
  }

  if (!products || !featuredProducts || !newProducts || !categories) {
    return <div>Error loading data</div>;
  }

  const topLevelCategories = (
    Array.isArray(categories) ? categories : []
  ).filter((cat) => !cat.parentId);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />

        <div className="container px-4 md:px-6">
          <PromotionalSection />

          <NewestProductsSection />

          <FeaturedProductsSection />

          <section className="py-8">
            <PromotionalBanner
              title="Summer Sale"
              description="Upgrade your tech with amazing discounts"
              ctaText="Shop the Sale"
              ctaLink="/products?sale=true"
              imageSrc="/placeholder.svg"
              imageAlt="Summer Sale"
              variant="primary"
              size="medium"
            />
          </section>

          {topLevelCategories.map(
            (cat: { id: Key | null | undefined; slug: string }) => (
              <CategoryProductsSection key={cat.id} category={cat.slug} />
            )
          )}

          <SpecialOfferCarousel products={products} />

          <CategoriesSection />
        </div>
      </main>
    </div>
  );
}
