"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function InventoryOverview() {
  // Mock data for demonstration
  const inventoryData = {
    totalProducts: 1247,
    inStock: 1089,
    lowStock: 98,
    outOfStock: 60,
    totalValue: 245670,
    categories: [
      { name: "Electronics", stock: 89, total: 120, status: "good" },
      { name: "Clothing", stock: 45, total: 200, status: "low" },
      { name: "Books", stock: 0, total: 50, status: "out" },
      { name: "Home & Garden", stock: 156, total: 180, status: "good" },
    ],
  };

  const getStockStatus = (stock: number, total: number) => {
    const percentage = (stock / total) * 100;
    if (stock === 0)
      return {
        status: "out",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: AlertTriangle,
      };
    if (percentage < 25)
      return {
        status: "low",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        icon: TrendingDown,
      };
    return {
      status: "good",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: CheckCircle,
    };
  };

  const stockPercentage =
    (inventoryData.inStock / inventoryData.totalProducts) * 100;
  const lowStockPercentage =
    (inventoryData.lowStock / inventoryData.totalProducts) * 100;
  const outOfStockPercentage =
    (inventoryData.outOfStock / inventoryData.totalProducts) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          Inventory Overview
        </CardTitle>
        <p className="text-sm text-gray-600">
          Stock levels and inventory management
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-900">
              {inventoryData.totalProducts}
            </p>
            <p className="text-xs text-blue-600">Total Products</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(inventoryData.totalValue)}
            </p>
            <p className="text-xs text-green-600">Inventory Value</p>
          </div>
        </div>

        {/* Stock Distribution */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Stock Distribution
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {inventoryData.inStock}
                </span>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 text-xs">
                  {stockPercentage.toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={stockPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Low Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {inventoryData.lowStock}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 text-xs">
                  {lowStockPercentage.toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={lowStockPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {inventoryData.outOfStock}
                </span>
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-800 text-xs">
                  {outOfStockPercentage.toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={outOfStockPercentage} className="h-2" />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Category Status</h4>
          <div className="space-y-2">
            {inventoryData.categories.map((category, index) => {
              const statusInfo = getStockStatus(category.stock, category.total);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${statusInfo.bg}`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className={`text-sm ${statusInfo.color}`}>
                    {category.stock}/{category.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
