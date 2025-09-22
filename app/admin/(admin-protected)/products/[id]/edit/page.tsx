import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllBrands } from "@/data/brands";
import { getCategoriesWithParents } from "@/data/category";
import { getProductById } from "@/data/consolidated-products-fetch";
import ProductForm from "@/components/admin/forms/products/form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getCategoriesWithParents(),
    getAllBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading....</div>}>
      <ProductForm product={product} categories={categories} brands={brands} />
    </Suspense>
  );
}
