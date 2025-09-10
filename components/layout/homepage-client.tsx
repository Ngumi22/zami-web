"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PromotionalBanner } from "@/components/home/promotional-banner";
import {
  TabbedProducts,
  PromotionalSection,
  CategoriesSection,
  DiscountedProducts,
  CategoryProductsSection,
  PromotionalSection1,
} from "@/components/home/product-sections";
import { useHomeData } from "@/lib/hooks";
import { BlogPost, Brand, Category, Collection, Product } from "@prisma/client";
import HeroCarousel from "./hero/hero-carousel";
import { BrandProductsGrid } from "../home/brand-sections";
import { SpecialOffers } from "../home/offers-section";
import { RecentlyViewed } from "../home/recently-viewed";
import { FlashSaleClient } from "../home/flash-sale-section-client";
import BlogSection from "../home/blog-section";
import { CollectionsDisplay } from "../home/collections-section";

type CollectionWithProduct = Collection & {
  products: Product[];
};

type ProductWithBrand = Product & {
  brand?: Brand;
  saleEndDate?: Date;
};

interface HomePageClientProps {
  initialProducts: ProductWithBrand[];
  initialFeatured: ProductWithBrand[];
  initialNewArrivals: ProductWithBrand[];
  initialCategories: Category[];
  flashSaleData?: {
    products: Product[];
    saleEndDate: Date;
    collectionName: string;
  } | null;

  blogPosts: BlogPost[];
  collections: CollectionWithProduct[];
}

export default function HomePageClient({
  initialProducts,
  initialFeatured,
  initialNewArrivals,
  initialCategories,
  flashSaleData,
  blogPosts,
  collections,
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
          <HeroCarousel />
          <div className="md:container px-4 md:px-6 space-y-6">
            <PromotionalSection />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1">
        <HeroCarousel />
        <div className="md:container p-4 md:px-6 space-y-12">
          <PromotionalSection />

          {flashSaleData && (
            <FlashSaleClient
              products={flashSaleData.products}
              saleEndDate={flashSaleData.saleEndDate}
              collectionName={flashSaleData.collectionName}
            />
          )}

          <CategoriesSection categories={categories} />
          <TabbedProducts featured={featured} newArrivals={newProducts} />

          <DiscountedProducts products={products} />
          <SpecialOffers products={products} categories={categories} />

          <CollectionsDisplay collections={collections} />

          <PromotionalSection1 />

          <BrandProductsGrid
            products={products}
            categories={categories}
            brands={[
              {
                name: "Hp",
                description: "Powerful Hp laptops, Computers and accessories",
                filterKey: "HP",
              },
              {
                name: "Samsung",
                description: "All Samsung devices and accessories",
                filterKey: "samsung",
              },
            ]}
            maxProductsPerBrand={6}
          />
          {topLevelCategories.slice(0, 4).map((cat) => (
            <CategoryProductsSection
              key={cat.id}
              category={cat.slug}
              products={products}
              categories={categories}
            />
          ))}

          <RecentlyViewed allProducts={products} />

          <BlogSection blogPosts={blogPosts} />
        </div>
      </div>
    </main>
  );
}
