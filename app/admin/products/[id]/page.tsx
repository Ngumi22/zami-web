import { notFound } from "next/navigation";
import { ComprehensiveProductDetails } from "@/components/admin/product-sections/comprehensive-product-details";
import { Suspense } from "react";
import { getFullProductBySlug } from "@/data/product";
import { getAllBrands } from "@/data/brands";
import { getAllCategories } from "@/data/category";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const [product, categories, brands] = await Promise.all([
    getFullProductBySlug(slug),
    getAllCategories(),
    getAllBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading....</div>}>
      <ComprehensiveProductDetails
        product={product}
        categories={categories}
        brands={brands}
      />
    </Suspense>
  );
}
