import { Suspense } from "react";
import { getAllCategories } from "@/data/category";
import ProductForm from "@/components/admin/forms/products/product-form";
import { getAllBrands } from "@/data/cat";

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
