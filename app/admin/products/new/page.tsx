import { Suspense } from "react";
import { getAllCategories } from "@/data/category";
import { getAllBrands } from "@/data/brands";
import ProductForm from "@/components/admin/forms/products/product-form";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductForm categories={categories} brands={brands} />
    </Suspense>
  );
}
