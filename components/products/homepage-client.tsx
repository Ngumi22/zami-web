"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/components/home/hero-section";
import { PromotionalBanner } from "@/components/home/promotional-banner";
import {
  TabbedProducts,
  TabbedBrands,
  SpecialOfferCarousel,
  PromotionalSection,
  CategoriesSection,
  DiscountedProducts,
  CategoryProductsSection,
} from "@/components/home/product-sections";
import { useHomeData } from "@/lib/hooks";
import { Brand, Category, Product } from "@prisma/client";

type ProductWithBrand = Product & {
  brand?: Brand;
};

interface HomePageClientProps {
  initialProducts: ProductWithBrand[];
  initialFeatured: ProductWithBrand[];
  initialNewArrivals: ProductWithBrand[];
  initialCategories: Category[];
}

export default function HomePageClient({
  initialProducts,
  initialFeatured,
  initialNewArrivals,
  initialCategories,
}: HomePageClientProps) {
  const {
    products,
    featured,
    newProducts,
    categories,
    queries: {
      productsQuery,
      featuredQuery,
      newArrivalsQuery,
      categoriesQuery,
    },
  } = useHomeData({
    initialProducts,
    initialFeatured,
    initialNewArrivals,
    initialCategories,
  }) as {
    products: ProductWithBrand[];
    featured: ProductWithBrand[];
    newProducts: ProductWithBrand[];
    categories: Category[];
    queries: any;
  };

  const isLoading = useMemo(
    () =>
      productsQuery.isLoading ||
      featuredQuery.isLoading ||
      newArrivalsQuery.isLoading ||
      categoriesQuery.isLoading,
    [
      productsQuery.isLoading,
      featuredQuery.isLoading,
      newArrivalsQuery.isLoading,
      categoriesQuery.isLoading,
    ]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <HeroSection />
          <div className="container px-4 md:px-6">
            <PromotionalSection />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!products || !featured || !newProducts || !categories) {
    return <div>Error loading data</div>;
  }

  const topLevelCategories = categories.filter((cat) => !cat.parentId);

  const brands = useMemo(() => {
    const brandMap = new Map<string, ProductWithBrand["brand"]>();
    for (const product of products) {
      if (product.brand && !brandMap.has(product.brand.id)) {
        brandMap.set(product.brand.id, product.brand);
      }
    }
    return Array.from(brandMap.values()).filter(
      (b): b is Brand => b !== undefined
    );
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />

        <div className="container px-4 md:px-6">
          <CategoriesSection categories={categories} />
          <PromotionalSection />
          <TabbedProducts featured={featured} newArrivals={newProducts} />
          <div>
            <p className="text-center text-xl mb-1 font-bold">
              Shop Your Favorite Brand
            </p>
            <TabbedBrands brands={brands} products={products} />
          </div>

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

          <DiscountedProducts products={products} />

          {topLevelCategories.map((cat) => (
            <CategoryProductsSection
              key={cat.id}
              category={cat.slug}
              products={products}
              categories={categories}
            />
          ))}

          <SpecialOfferCarousel products={products} />
        </div>
      </main>
    </div>
  );
}
