"use client";

import { ProductCarousel, ProductCarouselItem } from "./product-carousel";
import { ProductCard } from "../admin/product-sections/product-card";
import { Brand, Category, Product } from "@prisma/client";
import { PromotionalBanner } from "./promotional-banner";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { categoryIcons } from "@/lib/constants";
import { useMemo, useRef } from "react";

import { ProductCarouselSkeleton } from "./productCarouselSkeleton";
import ProductGrid from "../products/products-grid/products-grid";

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

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories?.length) {
    return null;
  }

  const topLevel = categories.filter((cat) => cat.parentId === null);
  const descendantsMap = buildCategoryDescendantsMap(categories);

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Browse By Category
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topLevel.map((category) => {
            const Icon =
              categoryIcons[category.slug as keyof typeof categoryIcons] ||
              Smartphone;

            const subcategoryIds = descendantsMap.get(category.id) || [];
            const subcategories = subcategoryIds

              .map((subId) => categories.find((c) => c.id === subId))
              .filter(Boolean);

            return (
              <div
                key={category.id}
                className="group bg-white p-4 rounded-md border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out flex flex-row gap-5 items-center">
                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={`${category.name} category`}
                      width={112}
                      height={112}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 group-hover:text-red-500 transition-colors" />
                  )}
                </div>

                <div className="flex flex-col flex-grow h-full">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-2">
                      {category.name}
                    </h3>
                    {subcategories.length > 0 && (
                      <div className="flex flex-col space-y-1">
                        {subcategories
                          .filter((cat) => cat?.parentId !== null)
                          .slice(0, 4)
                          .map((sub) => (
                            <Link
                              href={`/products?category=${category.slug}&subcategories=${sub?.slug}`}
                              key={sub?.id}
                              className="text-xs sm:text-sm text-gray-500 hover:text-black">
                              {sub?.name}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-3">
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="text-xs sm:text-sm text-gray-700 uppercase tracking-wide hover:text-black transition-all duration-200 border-b-2 border-gray-300 hover:border-black pb-0.5">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CategoryProductsSection({
  category,
  products,
  categories,
}: {
  category: string;
  products: Product[];
  categories: Category[];
}) {
  const descendantsMap = buildCategoryDescendantsMap(categories);

  const matchedCategory = categories.find(
    (cat) => cat.slug.toLowerCase() === category.toLowerCase()
  );
  if (!matchedCategory) return null;

  const descendantIds = descendantsMap.get(matchedCategory.id) || [
    matchedCategory.id,
  ];

  const filtered = products.filter((p) => descendantIds.includes(p.categoryId));

  if (filtered.length === 0) return null;

  return (
    <section className="py-4">
      <ProductCarousel
        title={`${matchedCategory.name} (${filtered.length})`}
        viewAllHref={`/products?category=${matchedCategory.slug}`}>
        {filtered.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function TabbedProducts({
  featured,
  newArrivals,
}: {
  featured: Product[];
  newArrivals: Product[];
}) {
  return (
    <div>
      <ProductGrid
        tabs={[
          {
            label: "Featured",
            products: featured,
          },
          {
            label: "Latest Products",
            products: newArrivals,
          },
        ]}
        tabPosition="left"
      />
    </div>
  );
}

export function TabbedBrands({
  brands,
  products,
}: {
  brands: Brand[];
  products: Product[];
}) {
  const tabs = brands.map((brand) => ({
    label: brand.name,
    products: products.filter((product) => product.brandId === brand.id),
  }));

  return (
    <div>
      <ProductGrid tabs={tabs} tabPosition="center" />
    </div>
  );
}

export function BrandsSection({
  brands,
}: {
  brands: { slug: string; logo?: string }[];
}) {
  if (!brands?.length) return null;

  return (
    <section className="container max-w-7xl py-4">
      <h2 className="text-xl font-bold mb-3">Browse by Brand</h2>
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

export function SpecialOfferCarousel({ products }: { products: Product[] }) {
  return (
    <section className="py-4">
      <ProductCarousel title="Recommended For You">
        <ProductCarouselItem className="w-[200px] h-full">
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
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function DiscountedProducts({ products }: { products: Product[] }) {
  const discountedProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.originalPrice && product.originalPrice > product.price
      )
      .sort((a, b) => b.originalPrice! - b.price - (a.originalPrice! - a.price))
      .slice(0, 5);
  }, [products]);

  return (
    <section className="py-4">
      <ProductCarousel title="Hot Sales & Discounts" viewAllHref="/products">
        {discountedProducts.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function PromotionalSection() {
  return (
    <section className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PromotionalBanner
          title="Pre-Loved Laptops"
          description="Laptops Amazing Discounts and Deals Today"
          ctaText="Shop Now"
          ctaLink="/products"
          imageSrc="/placeholder.svg"
          imageAlt="pre-loved Laptops"
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
          title="Featured Products"
          description="Featured tech gadgets"
          ctaText="Discover"
          ctaLink="/products?featured=true"
          imageSrc="/placeholder.svg"
          imageAlt="Featured Products"
          variant="secondary"
          size="small"
        />
      </div>
    </section>
  );
}
