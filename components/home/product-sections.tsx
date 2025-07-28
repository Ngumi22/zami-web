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
import { useRef } from "react";
import {
  useBrands,
  useCategories,
  useFeaturedProducts,
  useNewArrivals,
  useProducts,
} from "@/lib/hooks";
import { ProductCarouselSkeleton } from "./productCarouselSkeleton";

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

export function CategoryProductsSection({ category }: { category: string }) {
  const { data: categories } = useCategories();
  const { data: products } = useProducts();

  if (!categories || !products) return null;

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

export function NewestProductsSection() {
  const { data: newArrivals, isLoading, isError } = useNewArrivals(8);

  if (isLoading) return <ProductCarouselSkeleton title="New Arrivals" />;
  if (isError || !newArrivals?.length) return null;

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

export function FeaturedProductsSection() {
  const { data: featuredProducts, isLoading, isError } = useFeaturedProducts(6);

  if (isLoading) return <ProductCarouselSkeleton title="Featured Products" />;
  if (isError || !featuredProducts?.length) return null;

  return (
    <section className="py-8">
      <ProductCarousel
        title="Featured Products"
        viewAllHref="/products?featured=true">
        {featuredProducts.map((product) => (
          <ProductCarouselItem key={product.id} className="w-[280px]">
            <ProductCard product={product} />
          </ProductCarouselItem>
        ))}
      </ProductCarousel>
    </section>
  );
}

export function BrandsSection() {
  const { data: brands, isLoading, isError } = useBrands();

  if (isLoading) return [];
  if (isError || !brands?.length) return null;

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

export function CategoriesSection() {
  const { data: categories, isLoading, isError } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  if (isLoading) return [];
  if (isError || !categories?.length) return null;

  return (
    <section className="md:container md:max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Browse By Category</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-transparent"
            onClick={scrollLeft}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-transparent"
            onClick={scrollRight}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-center justify-center gap-6 overflow-x-auto pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category) => {
          const IconComponent =
            categoryIcons[category.slug as keyof typeof categoryIcons] ||
            Smartphone;

          return (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group flex-shrink-0">
              <div className="flex flex-col items-center justify-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-red-500 w-32 h-32">
                <div className="flex items-center justify-center w-12 h-12">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <IconComponent className="w-8 h-8 text-gray-700 group-hover:text-red-500 transition-colors" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {category.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
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
