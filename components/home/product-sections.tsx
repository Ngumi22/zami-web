"use client";

import { ProductCarousel, ProductCarouselItem } from "./product-carousel";
import { ProductCard } from "../admin/product-sections/product-card";
import { Brand, Category, Product } from "@prisma/client";
import { PromotionalBanner } from "./promotional-banner";
import Image from "next/image";
import Link from "next/link";

function buildCategoryDescendantsMap(categories: Category[]) {
  const childrenMap = new Map<string, string[]>();
  const descendantsMap = new Map<string, string[]>();

  for (const cat of categories) {
    if (cat.parentId) {
      if (!childrenMap.has(cat.parentId)) {
        childrenMap.set(cat.parentId, []);
      }
      childrenMap.get(cat.parentId)!.push(cat.id);
    }
  }

  function collectDescendants(id: string): string[] {
    const descendants = [id];
    const children = childrenMap.get(id) || [];
    for (const childId of children) {
      descendants.push(...collectDescendants(childId));
    }
    return descendants;
  }

  for (const cat of categories) {
    descendantsMap.set(cat.id, collectDescendants(cat.id));
  }

  return descendantsMap;
}

export function CategoryProductsSection({
  products,
  category,
  categories,
}: {
  products: Product[];
  category: string;
  categories: Category[];
}) {
  const descendantsMap = buildCategoryDescendantsMap(categories);

  const matchedCategory = categories.find(
    (cat) => cat.slug.toLowerCase() === category.toLowerCase()
  );

  if (!matchedCategory) return null;

  const descendantCategoryIds = descendantsMap.get(matchedCategory.id) || [
    matchedCategory.id,
  ];

  const filteredProducts = products.filter((product) =>
    descendantCategoryIds.includes(product.categoryId)
  );

  if (filteredProducts.length === 0) return null;

  return (
    <section className="py-8">
      <ProductCarousel
        title={`${matchedCategory.name} (${filteredProducts.length})`}
        viewAllHref={`/products?category=${matchedCategory.slug}`}>
        {filteredProducts.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function NewestProductsSection({
  newArrivals,
}: {
  newArrivals: Product[];
}) {
  return (
    <section className="py-8">
      <ProductCarousel title="New Arrivals" viewAllHref="/products?sort=newest">
        {newArrivals.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function FeaturedProductsSection({
  featuredproducts,
}: {
  featuredproducts: Product[];
}) {
  return (
    <section className="py-8">
      <ProductCarousel
        title="Featured Products"
        viewAllHref="/products?featured=true">
        {featuredproducts.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function SpecialOfferCarousel({ products }: { products: Product[] }) {
  return (
    <section className="py-8">
      <ProductCarousel title="Recommended For You" className="">
        <ProductCarouselItem className="w-[200px] h-[340px]">
          <PromotionalBanner
            title="Special Offer"
            description="Limited time deal"
            ctaText="Shop Now"
            ctaLink="/products?special=true"
            imageSrc="/placeholder.svg"
            imageAlt="Special Offer"
            variant="accent"
            size="large"
            className="h-full"
          />
        </ProductCarouselItem>

        {products.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px] ">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function BrandsSection({ brands }: { brands: Brand[] }) {
  return (
    <section className="container max-w-7xl py-8">
      <h2 className="text-2xl font-bold mb-6">Browse by Brand</h2>
      <div className="flex items-center justify-center flex-wrap gap-4">
        {brands.map((brand) => (
          <a
            key={brand.slug}
            href={`/products?brand=${brand.slug}`}
            className="aspect-square h-24 flex items-center justify-center">
            <Image
              src={brand.logo || "/placeholder.svg"}
              alt={brand.slug}
              height={100}
              width={100}
              className="w-auto h-auto"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="container max-w-7xl py-8">
      <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
      <div className="flex items-center justify-center flex-wrap gap-4">
        {categories.map((category) => (
          <div
            key={category.slug}
            className="aspect-square h-24 flex-col items-center justify-center">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.slug}
              height={50}
              width={50}
              className="w-auto h-full"
            />

            <Link href={`/products?category=${category.slug}`}>
              {category.name}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PromotionalSection() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PromotionalBanner
          title="Crazy Sale"
          description="Get up to 40% off on selected electronics"
          ctaText="Shop Now"
          ctaLink="/products?sale=true"
          imageSrc="/placeholder.svg"
          imageAlt="Crazy Sale"
          variant="primary"
          size="small"
        />
        <PromotionalBanner
          title="New Arrivals"
          description="Check out the latest tech gadgets"
          ctaText="Discover"
          ctaLink="/products?sort=newest"
          imageSrc="/placeholder.svg"
          imageAlt="New Arrivals"
          variant="secondary"
          size="small"
        />
        <PromotionalBanner
          title="New Arrivals"
          description="Check out the latest tech gadgets"
          ctaText="Discover"
          ctaLink="/products?sort=newest"
          imageSrc="/placeholder.svg"
          imageAlt="New Arrivals"
          variant="secondary"
          size="small"
        />
      </div>
    </section>
  );
}
