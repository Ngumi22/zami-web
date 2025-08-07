import { GetProductsParams } from "@/data/product-page-product";

export const cacheKeys = {
  product: (id: string) => ["product", id],
  brand: (id: string) => ["brand", id],
  category: (id: string) => ["category", id],
  productBySlug: (slug: string) => ["product-slug", sanitizeSlug(slug)],
  products: (params?: Record<string, any>) => ["products", params],
  filteredProducts: (params: GetProductsParams) => [
    "filtered-products",
    params,
  ],
  productsMaxPrice: (
    params?: Omit<GetProductsParams, "sort" | "page" | "pageSize">
  ) => ["products-max-price", params],
  productsCount: (
    params?: Omit<GetProductsParams, "sort" | "page" | "pageSize">
  ) => ["products-count", params],
  brands: (params?: Record<string, any>) => ["brands", params],
  categories: (params?: Record<string, any>) => ["categories", params],
  featured: (limit: number) => ["products", "featured", limit],
  newArrivals: (limit: number) => ["products", "new", limit],
  productsByCategory: (categoryId: string, limit?: number) => [
    "products-by-category",
    categoryId,
    limit,
  ],
  allCategoriesWithSpecifications: () => ["all-categories-with-specifications"],
  maxPricePerMainCategory: (slug: string) => ["maxPrice", slug],
  allBrands: () => ["all-brands"],
};

export const cacheTags = {
  product: (id: string) => `product_${id}`,
  brand: (id: string) => `brand_${id}`,
  category: (id: string) => `category_${id}`,
  productBySlug: (slug: string) => `product_${sanitizeSlug(slug)}`,
  productsByCategory: (categoryId: string) =>
    `products_by_category_${categoryId}`,
  byBrand: (brandId: string) => `products_by_brand_${brandId}`,
  featuredProducts: () => "featured",
  products: () => "all",
  filteredProducts: (params: GetProductsParams) =>
    `filtered_products_${JSON.stringify(params)}`,
  productsBySpec: (specKey: string, specValue: string) =>
    `products_by_spec_${specKey}_${specValue}`,
  brands: () => "brands",
  categories: () => "categories",
  newArrivals: () => "new",
  reviews: (productId: string) => `reviews_${productId}`,
  reviewsBatch: (ids: string[]) => `reviews_batch_${ids.join("_")}`,
};

function sanitizeSlug(slug: string) {
  return slug.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 64);
}
