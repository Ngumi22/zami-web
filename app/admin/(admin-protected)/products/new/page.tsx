import { Suspense } from "react";
import ProductForm from "@/components/admin/forms/products/form";
import { getCategoriesWithParents } from "@/data/category";
import { getAllBrands } from "@/data/brands";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategoriesWithParents(),
    getAllBrands(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductForm categories={categories} brands={brands} />
    </Suspense>
  );
}
