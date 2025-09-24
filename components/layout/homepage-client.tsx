"use client";

import {
  TabbedProducts,
  PromotionalSection,
  CategoriesSection,
  DiscountedProducts,
  CategoryProductsSection,
  PromotionalSection1,
} from "@/components/home/product-sections";
import { BlogPost, Category } from "@prisma/client";
import HeroCarousel from "./hero/hero-carousel";
import { BrandProductsGrid } from "../home/brand-sections";
import { SpecialOffers } from "../home/offers-section";
import { RecentlyViewed } from "../home/recently-viewed";
import { FlashSaleClient } from "../home/flash-sale-section-client";
import BlogSection from "../home/blog-section";
import {
  CollectionsDisplay,
  CollectionWithProduct,
} from "../home/collections-section";
import { getFlashSaleData, ProductCardData } from "@/data/fetch-all";

interface HomePageClientProps {
  initialProducts: ProductCardData[];
  initialFeatured: ProductCardData[];
  initialNewArrivals: ProductCardData[];
  initialCategories: Category[];
  initialFlashSaleData: Awaited<ReturnType<typeof getFlashSaleData>>;
  blogPosts: BlogPost[];
  collections: CollectionWithProduct[];
}

export default function HomePageClient({
  initialProducts,
  initialFeatured,
  initialNewArrivals,
  initialCategories,
  initialFlashSaleData,
  blogPosts,
  collections,
}: HomePageClientProps) {
  // Use the props directly, no need for the useHomeData hook.
  const products = initialProducts;
  const featured = initialFeatured;
  const newProducts = initialNewArrivals;
  const categories = initialCategories;
  const flashSaleData = initialFlashSaleData;

  const topLevelCategories = categories.filter((cat) => !cat.parentId);

  // The condition below has been updated to no longer check for flashSaleData.
  // getFlashSaleData returns null when there is no active sale, which is the
  // expected behavior, not an error state.
  if (!products || !featured || !newProducts || !categories) {
    return <div>Error loading data</div>;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1">
        <HeroCarousel />
        <div className="md:container p-4 md:px-6 space-y-12">
          <PromotionalSection />

          {/* This conditional rendering is the correct way to handle optional data. */}
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
