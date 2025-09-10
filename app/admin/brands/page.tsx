import { Suspense } from "react";
import BrandsTable from "@/components/admin/brand-sections/brand-table";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { getAllBrands } from "@/data/brands";

export default async function AdminBrandsPage() {
  const brands = await getAllBrands();
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BrandsTable brands={brands} />
    </Suspense>
  );
}
