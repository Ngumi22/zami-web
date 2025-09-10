import { Suspense } from "react";
import CategoriesTable from "@/components/admin/category-sections/categories-page";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { getCachedCategories } from "@/data/productspage/getProducts";

export default async function CategoriesPage() {
  const categories = await getCachedCategories();
  return (
    <div className="mx-auto">
      <Suspense fallback={<TableSkeleton />}>
        <CategoriesTable categories={categories} />
      </Suspense>
    </div>
  );
}
