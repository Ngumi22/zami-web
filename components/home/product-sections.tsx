"use client";

import { ProductCarousel, ProductCarouselItem } from "./product-carousel";

import { Brand, Category } from "@prisma/client";
import { PromotionalBanner } from "./promotional-banner";
import Image from "next/image";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import { categoryIcons } from "@/lib/constants";
import { useMemo } from "react";

import ProductGrid from "../products/products-grid/products-grid";
import { ProductCardData } from "@/data/fetch-all";
import ProductCard from "./card-product";

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
    <section className="sm:py-12 bg-white">
      <div className="text-left mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Shop By Category
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
                  <h3 className="font-semibold text-base text-gray-800 mb-2">
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
                    className="text-xs text-black uppercase tracking-wide hover:text-gray-700 transition-all duration-200 border-b-2 border-black hover:border-gray-700">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
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
  products: ProductCardData[];
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

  const filtered = products.filter((p) =>
    descendantIds.includes(p.category.name)
  );

  if (filtered.length === 0) return null;

  return (
    <ProductCarousel
      title={
        <div className="flex items-center">
          Shop {matchedCategory.name}
          <span className="ml-6 text-sm text-muted-foreground">
            {filtered.length} products
          </span>
        </div>
      }
      viewAllHref={`/products?category=${matchedCategory.slug}`}>
      {filtered.map((product) => (
        <ProductCarouselItem key={product.id}>
          <ProductCard product={product} />
        </ProductCarouselItem>
      ))}
    </ProductCarousel>
  );
}

export function TabbedProducts({
  featured,
  newArrivals,
}: {
  featured: ProductCardData[];
  newArrivals: ProductCardData[];
}) {
  return (
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
  );
}

export function TabbedBrands({
  brands,
  products,
}: {
  brands: Brand[];
  products: ProductCardData[];
}) {
  const tabs = brands.map((brand) => ({
    label: brand.name,
    products: products.filter((product) => product.brand === brand.id),
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
    <section>
      <h2 className="text-xl font-semibold mb-3">Browse by Brand</h2>
      <div className="flex items-center justify-center flex-wrap gap-4">
        {brands.map((brand) => (
          <a
            key={brand.slug}
            href={`/products?brand=${brand.slug}`}
            className="aspect-square h-24 flex items-center justify-center">
            <Image
              src={brand.logo || "/bannerV5-img10.webp"}
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

export function SpecialOfferCarousel({
  products,
}: {
  products: ProductCardData[];
}) {
  const discountedProducts = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .map((product) => {
      const discountPercentage = Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      );
      return {
        ...product,
        discountPercentage,
      };
    })
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 5);

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-semibold text-foreground my-2">
        Special Offers
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {discountedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export function DiscountedProducts({
  products,
}: {
  products: ProductCardData[];
}) {
  const discountedProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!product.originalPrice || product.originalPrice <= product.price) {
          return false;
        }
        const discountPercentage = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        );
        return discountPercentage >= 2;
      })
      .sort((a, b) => {
        const discountA =
          ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
        const discountB =
          ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
        return discountB - discountA;
      })
      .slice(0, 5);
  }, [products]);

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      title={
        <div>
          Hottest Sales & Discounts
          <span className="ml-6 text-sm text-muted-foreground hidden md:flex">
            + 30% Off
          </span>
        </div>
      }
      viewAllHref="/products">
      {discountedProducts.map((product) => (
        <ProductCarouselItem key={product.id}>
          <ProductCard product={product} />
        </ProductCarouselItem>
      ))}
    </ProductCarousel>
  );
}

export function PromotionalSection() {
  return (
    <section className="w-full">
      <div
        className="
          grid
          grid-flow-col auto-cols-[80%] md:auto-cols-[60%] lg:auto-cols-[32%]
          gap-4 md:gap-6
          overflow-x-auto lg:overflow-visible
          scroll-smooth
          snap-x snap-mandatory lg:snap-none
          scrollbar-hide
          px-4 lg:px-0
        ">
        <PromotionalBanner
          title="Pre-Loved Laptops"
          description="Save big on certified refurbished laptops for work, school, and gaming."
          ctaText="Shop Deals"
          ctaLink="/products?category=laptops"
          imageSrc="/bannerV5-img10.webp"
          imageAlt="Refurbished laptops on sale"
          variant="primary"
          size="medium"
          className="snap-start lg:snap-none"
        />

        <PromotionalBanner
          title="New Arrivals"
          description="Explore the newest laptops, smartphones, and accessories today."
          ctaText="Discover Now"
          ctaLink="/products?sort=newest"
          imageSrc="/bannerV5-img5.webp"
          imageAlt="New laptops and smartphones"
          variant="primary"
          size="medium"
          className="snap-start lg:snap-none"
        />

        <PromotionalBanner
          title="Featured Products"
          description="Shop our handpicked bestsellers in laptops, phones, and more."
          ctaText="Explore Featured"
          ctaLink="/products?featured=true"
          imageSrc="/ipho.png"
          imageAlt="Featured tech gadgets"
          variant="primary"
          size="medium"
          className="snap-start lg:snap-none"
        />
      </div>
    </section>
  );
}

export function PromotionalSection1() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PromotionalBanner
          title="Back to School"
          description="Affordable laptops, tablets, and accessories for students of every level."
          ctaText="Shop Student Deals"
          ctaLink="/products?collection=back-to-school"
          imageSrc="/lap.webp"
          imageAlt="Back to school laptops and student gadgets"
          variant="primary"
          size="large"
        />

        <PromotionalBanner
          title="Business & Work Laptops"
          description="Powerful laptops and printers built for productivity and performance."
          ctaText="Shop Business"
          ctaLink="/products?collection=business-laptops"
          imageSrc="/promo.webp"
          imageAlt="Business laptops and office printers"
          variant="secondary"
          size="large"
        />
      </div>
    </section>
  );
}
