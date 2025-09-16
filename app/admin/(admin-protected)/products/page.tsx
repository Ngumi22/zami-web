import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductsTable } from "@/components/admin/product-sections/products-table";
import ProductsPageStats from "@/components/admin/admin-home-sections/dash-stats";
import { ProductsPageSkeleton } from "@/components/admin/admin-home-sections/product-page-skeleton";
import { getProductsStats } from "@/data/product";
import { getProducts } from "@/data/consolidated-products-fetch";

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([
    getProducts({}),
    getProductsStats(),
  ]);

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Products</h1>
            <p className="text-gray-600">
              Manage your product inventory and catalog
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
          <ProductsPageStats stats={stats} />
        </Suspense>

        <ProductsTable products={products} />
      </div>
    </Suspense>
  );
}
