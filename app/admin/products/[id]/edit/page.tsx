import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductById } from "@/data/product";
import { getAllBrands } from "@/data/brands";
import { getAllCategories } from "@/data/category";
import ProductForm from "@/components/admin/forms/products/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getAllCategories(),
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
