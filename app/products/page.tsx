import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsLoading from "@/components/products/loading";
import dynamic from "next/dynamic";
import { getProductsByFilters, ProductFilters } from "@/data/product-filters";

const ProductsContent = dynamic(
  () => import("@/components/products/products-content"),
  {
    loading: () => <ProductsLoading />,
  }
);

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products | Electronics Store",
    description: "Browse our wide selection of electronics",
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const reservedParams = new Set([
    "search",
    "category",
    "brand",
    "minPrice",
    "maxPrice",
    "sort",
    "page",
    "limit",
    "featured",
    "stock",
    "tags",
  ]);

  const parseSpecifications = (params: {
    [key: string]: string | string[] | undefined;
  }) => {
    const specifications: { [key: string]: string } = {};

    Object.entries(params).forEach(([key, value]) => {
      if (!reservedParams.has(key) && typeof value === "string") {
        const decodedKey = decodeURIComponent(key.replace(/\+/g, " "));
        const decodedValue = decodeURIComponent(value.replace(/\+/g, " "));

        const specKey = decodedKey
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        specifications[specKey] = decodedValue;
      }
    });
    return Object.keys(specifications).length > 0 ? specifications : undefined;
  };

  const filters: ProductFilters = {
    search: typeof params.search === "string" ? params.search : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    brand: typeof params.brand === "string" ? params.brand : undefined,
    minPrice: params.minPrice
      ? Number.parseFloat(params.minPrice as string)
      : undefined,
    maxPrice: params.maxPrice
      ? Number.parseFloat(params.maxPrice as string)
      : undefined,
    sort: typeof params.sort === "string" ? params.sort : "latest",
    page: params.page ? Number.parseInt(params.page as string, 10) : 1,
    limit: 12,
    featured:
      params.featured === "true"
        ? true
        : params.featured === "false"
        ? false
        : undefined,
    stock: params.stock
      ? Number.parseInt(params.stock as string, 10)
      : undefined,
    tags: Array.isArray(params.tags)
      ? params.tags
      : params.tags
      ? [params.tags]
      : undefined,
    specifications: parseSpecifications(params),
  };

  const data = await getProductsByFilters(filters);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ProductsLoading />}>
        <ProductsContent initialData={data} initialFilters={filters} />
      </Suspense>
    </div>
  );
}

export const revalidate = 300; // 5 minutes
export const fetchCache = "force-cache";
