"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  Star,
  Layers,
} from "lucide-react";

interface ProductsPageStatsProps {
  stats: {
    featuredProducts: number;
    totalVariants: number;
    totalValue: number;
    lowStockProducts: number;
    totalProducts: number;
    productsWithVariants: number;
  };
}

export default function ProductsPageStats({ stats }: ProductsPageStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-md font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            Active products in catalog
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Featured Products
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-md font-bold">{stats.featuredProducts}</div>
          <p className="text-xs text-muted-foreground">
            Products marked as featured
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Variants</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-md font-bold">{stats.productsWithVariants}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalVariants} total variants
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-md font-bold text-red-600">
            {stats.lowStockProducts}
          </div>
          <p className="text-xs text-muted-foreground">
            Products with ≤10 units
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">
            {formatCurrency(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">Total inventory value</p>
        </CardContent>
      </Card>
    </div>
  );
}
