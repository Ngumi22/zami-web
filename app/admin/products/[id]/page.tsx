import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/admin/product-sections/comprehensive-product-details";
import { Suspense } from "react";
import {
  getProductBySlug,
  getProducts,
} from "@/data/consolidated-products-fetch";
import { getAllCategories } from "@/data/category";
import { getAllBrands } from "@/data/brands";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const [product, categories, brands, products] = await Promise.all([
    getProductBySlug(slug),
    getAllCategories(),
    getAllBrands(),
    getProducts({}),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading....</div>}>
      <ProductDetails
        product={product}
        categories={categories}
        brands={brands}
        products={products}
      />
    </Suspense>
  );
}
