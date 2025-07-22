import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsContent } from "@/components/products/products-content";
import { getAllBrands } from "@/data/brands";
import { getProductsWithFilters } from "@/data/product";
import { getAllCategories } from "@/data/category";

export const metadata: Metadata = {
  title: "Products - Computing & Technology",
  description:
    "Browse our complete collection of products including smartphones, laptops, printers and softwares",
};

interface SearchParams {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: string;
  page?: string;
  slug?: string;
  limit?: string | number;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
    page,
    limit,
    slug,
  } = await searchParams;

  const resolvedSearchParams = {
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
    page,
    slug,
    limit: 5,
  };

  const [products, categories, brands] = await Promise.all([
    getProductsWithFilters(resolvedSearchParams),
    getAllCategories(),
    getAllBrands(),
  ]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <ProductsContent
            initialProducts={products}
            categories={categories}
            brands={brands}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
