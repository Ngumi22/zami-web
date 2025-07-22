import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsTable } from "./products-table";
import { getAllProducts } from "@/data/product";

export default async function ProductsContent() {
  const products = await getAllProducts();
  return (
    <Suspense fallback={<Skeleton />}>
      <ProductsTable products={products} />
    </Suspense>
  );
}
