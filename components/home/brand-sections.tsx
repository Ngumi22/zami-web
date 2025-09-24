"use client";

import Link from "next/link";
import { Brand, Category } from "@prisma/client";
import { ProductCardData } from "@/data/fetch-all";
import ProductCard from "./card-product";

interface BrandConfig {
  name: string;
  description: string;
  filterKey: string;
  priority?: number;
}

interface BrandProductsGridProps {
  products: ProductCardData[];
  brands: BrandConfig[];
  categories: Category[];
  maxProductsPerBrand?: number;
  className?: string;
  showViewAll?: boolean;
}

export function BrandProductsGrid({
  products,
  brands,
  categories,
  maxProductsPerBrand = 8,
  showViewAll = true,
}: BrandProductsGridProps) {
  const brandSections = brands.map((brandConfig) => {
    const brandProducts = products
      .filter((product) =>
        product.brand
          .toLowerCase()
          .includes(brandConfig.filterKey.toLowerCase())
      )
      .slice(0, maxProductsPerBrand);

    return {
      ...brandConfig,
      products: brandProducts,
      hasProducts: brandProducts.length > 0,
    };
  });

  const validBrandSections = brandSections
    .filter((section) => section.hasProducts)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  if (validBrandSections.length === 0) return null;

  return (
    <div>
      {validBrandSections.map(
        ({ name, description, products: brandProducts }) => (
          <BrandSection
            key={name}
            brandName={name}
            products={brandProducts}
            categories={categories}
            description={description}
            showViewAll={showViewAll && brandProducts.length >= 5}
          />
        )
      )}
    </div>
  );
}

interface BrandSectionProps {
  brandName: string;
  products: ProductCardData[];
  categories: Category[];
  description: string;
  showViewAll: boolean;
  className?: string;
}

function BrandSection({
  brandName,
  products,
  categories,
  description,
  showViewAll,
  className = "",
}: BrandSectionProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category])
  );

  const getParentCategorySlug = (categoryId: string): string | null => {
    const category = categoryMap.get(categoryId);
    if (!category) return null;

    if (category.parentId === null) {
      return category.slug;
    }

    let currentCategory = category;
    while (currentCategory.parentId !== null) {
      const parentCategory = categoryMap.get(currentCategory.parentId);
      if (!parentCategory) break;
      currentCategory = parentCategory;
    }

    return currentCategory.slug;
  };

  const getMostCommonCategory = () => {
    const categoryCounts: Record<string, number> = {};

    products.forEach((product) => {
      if (product.category.name) {
        const parentSlug = getParentCategorySlug(product.category.name);
        if (parentSlug) {
          categoryCounts[parentSlug] = (categoryCounts[parentSlug] || 0) + 1;
        }
      }
    });

    let mostCommonCategory = "";
    let highestCount = 0;

    Object.entries(categoryCounts).forEach(([slug, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostCommonCategory = slug;
      }
    });

    return mostCommonCategory;
  };

  const mostCommonCategory = getMostCommonCategory();

  const viewAllUrl = mostCommonCategory
    ? `/products?category=${mostCommonCategory}&brand=${encodeURIComponent(
        brandName.toLowerCase()
      )}`
    : `/products?brand=${encodeURIComponent(brandName.toLowerCase())}`;

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="space-y-1 text-start">
        <h2 className="text-lg md:text-2xl font-semibold text-foreground my-2">
          Shop {brandName}
        </h2>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href={viewAllUrl}
          className="inline-flex text-sm items-center px-6 py-2 rounded-md transition-colors hover:text-black/55 font-medium">
          View All {brandName} Products
          <span className="ml-2">→</span>
        </Link>
      </div>
    </section>
  );
}
