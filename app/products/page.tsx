import {
  getAllBrands,
  getAllCategoriesWithSpecifications,
  getCategoryMaxPrice,
} from "@/data/cat";
import ClientProductsPage from "./client";
import { getProducts } from "@/data/product-page-product";

import { getSafeSearchParams } from "@/utils/search-params";
interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const reservedParams = new Set([
  "category",
  "subcategories",
  "brands",
  "priceMin",
  "priceMax",
  "sort",
  "page",
  "pageSize",
  "specifications",
]);

async function parseSpecifications(
  params: Awaited<ReturnType<typeof getSafeSearchParams>>
): Promise<Record<string, string[]>> {
  const specifications: Record<string, string[]> = {};
  const entries = params.entries();

  for (const [key, value] of entries) {
    if (!reservedParams.has(key)) {
      const decodedKey = decodeURIComponent(key.replace(/\+/g, " "));
      const values = Array.isArray(value) ? value : [value];
      const decodedValues = values
        .filter(Boolean)
        .map((val) => decodeURIComponent((val as string).replace(/\+/g, " ")));

      const specKey = decodedKey
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      specifications[specKey] = decodedValues;
    }
  }

  return specifications;
}

async function parseFilters(searchParams: {
  [key: string]: string | string[] | undefined;
}): Promise<{
  category?: string;
  subcategories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  sort: "rating" | "low" | "high" | "newest" | "popularity";
  page: number;
  pageSize: number;
  specifications: Record<string, string[]>;
}> {
  const params = await getSafeSearchParams(searchParams);
  const specifications = await parseSpecifications(params);

  return {
    category: params.get("category"),
    subcategories: params.getAll("subcategories"),
    brands: params.getAll("brands"),
    priceMin: params.get("priceMin") ? parseFloat(params.get("priceMin")!) : 0,
    priceMax: params.get("priceMax")
      ? parseFloat(params.get("priceMax")!)
      : Infinity,
    sort:
      params.get("sort") &&
      ["rating", "low", "high", "newest", "popularity"].includes(
        params.get("sort")!
      )
        ? (params.get("sort") as
            | "rating"
            | "low"
            | "high"
            | "newest"
            | "popularity")
        : "newest",
    page: params.get("page") ? parseInt(params.get("page")!, 10) : 1,
    pageSize: params.get("pageSize")
      ? parseInt(params.get("pageSize")!, 10)
      : 12,
    specifications,
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const filters = await parseFilters(params);
  const currentCategorySlug = filters.category ?? "laptops";

  const [products, categories, brands, maxPrice] = await Promise.all([
    getProducts(filters),
    getAllCategoriesWithSpecifications(),
    getAllBrands(),
    getCategoryMaxPrice(currentCategorySlug),
  ]);

  return (
    <ClientProductsPage
      initialProducts={products.products}
      initialCategories={categories}
      initialBrands={brands}
      initialFilters={filters}
      totalCount={products.totalCount}
      maxPrice={maxPrice}
    />
  );
}
