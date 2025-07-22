"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function SalesChart() {
  // Mock data for demonstration
  const salesData = [
    { month: "Jan", sales: 12500, orders: 45 },
    { month: "Feb", sales: 15200, orders: 52 },
    { month: "Mar", sales: 18900, orders: 61 },
    { month: "Apr", sales: 16800, orders: 58 },
    { month: "May", sales: 21300, orders: 67 },
    { month: "Jun", sales: 19500, orders: 63 },
  ];

  const maxSales = Math.max(...salesData.map((d) => d.sales));
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Sales Overview
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Revenue and order trends over the last 6 months
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Last 6 months
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Total Revenue
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Total Orders
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">{totalOrders}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Monthly Performance
            </h4>
            <div className="space-y-3">
              {salesData.map((data, index) => {
                const heightPercentage = (data.sales / maxSales) * 100;
                return (
                  <div key={data.month} className="flex items-center gap-4">
                    <div className="w-8 text-xs font-medium text-gray-600">
                      {data.month}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${heightPercentage}%` }}>
                          <span className="text-xs font-medium text-white">
                            {formatCurrency(data.sales)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 w-16 text-right">
                        {data.orders} orders
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Indicator */}
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                +23.5% growth compared to previous period
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
