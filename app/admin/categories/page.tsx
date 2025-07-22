import { Suspense } from "react";
import CategoriesTable from "@/components/admin/category-sections/categories-page";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { getAllCategories } from "@/data/category";

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return (
    <div className="mx-auto">
      <Suspense fallback={<TableSkeleton />}>
        <CategoriesTable categories={categories} />
      </Suspense>
    </div>
  );
}
