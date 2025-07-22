import HeroSection from "@/components/home/hero-section";
import { PromotionalBanner } from "@/components/home/promotional-banner";
import {
  BrandsSection,
  CategoryProductsSection,
  FeaturedProductsSection,
  SpecialOfferCarousel,
  NewestProductsSection,
  PromotionalSection,
  CategoriesSection,
} from "@/components/home/product-sections";

import {
  getAllFullProducts,
  getFullFeaturedProducts,
  newArrivals,
} from "@/data/product";
import { getAllBrands } from "@/data/brands";
import { getAllCategories } from "@/data/category";

export default async function HomePage() {
  const [products, newProducts, featuredProducts, brands, categories] =
    await Promise.all([
      getAllFullProducts(),
      newArrivals(),
      getFullFeaturedProducts(),
      getAllBrands(),
      getAllCategories(),
    ]);

  const categoryProductCounts = new Map<string, number>();

  for (const product of products) {
    const count = categoryProductCounts.get(product.categoryId) ?? 0;
    categoryProductCounts.set(product.categoryId, count + 1);
  }

  const topLevelCategories = categories.filter((cat) => !cat.parentId);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />

        <div className="container px-4 md:px-6">
          {/* Promo banner */}
          <PromotionalSection />
          <NewestProductsSection newArrivals={newProducts} />

          <FeaturedProductsSection featuredproducts={featuredProducts} />

          <section className="py-8">
            <PromotionalBanner
              title="Summer Sale - Up to 50% Off"
              description="Upgrade your tech with amazing discounts on the latest electronics."
              ctaText="Shop the Sale"
              ctaLink="/products?sale=true"
              imageSrc="/placeholder.svg"
              imageAlt="Summer Sale"
              variant="primary"
              size="medium"
            />
          </section>

          {topLevelCategories.map((cat) => (
            <CategoryProductsSection
              key={cat.id}
              products={products}
              categories={categories}
              category={cat.slug}
            />
          ))}

          <SpecialOfferCarousel products={products} />
          <section className="py-8">
            <PromotionalBanner
              title="Summer Sale - Up to 50% Off"
              description="Upgrade your tech with amazing discounts on the latest electronics."
              ctaText="Shop the Sale"
              ctaLink="/products?sale=true"
              imageSrc="/placeholder.svg"
              imageAlt="Summer Sale"
              variant="primary"
              size="medium"
            />
          </section>

          <CategoriesSection categories={topLevelCategories} />
        </div>
      </main>
    </div>
  );
}
