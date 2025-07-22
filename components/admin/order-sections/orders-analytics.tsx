"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
} from "lucide-react";
import type { OrderStats } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@prisma/client";

interface OrdersAnalyticsProps {
  stats: OrderStats;
  orders: Order[];
}

export function OrdersAnalytics({ stats, orders }: OrdersAnalyticsProps) {
  const formatPercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Calculate additional metrics
  const completionRate = formatPercentage(
    stats.completedOrders,
    stats.totalOrders
  );
  const cancellationRate = formatPercentage(
    stats.cancelledOrders,
    stats.totalOrders
  );
  const pendingRate = formatPercentage(stats.pendingOrders, stats.totalOrders);

  // Payment method analysis
  const paymentMethods = orders.reduce((acc, order) => {
    const method = order.paymentMethod.includes("Credit Card")
      ? "Credit Card"
      : order.paymentMethod;
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent activity (last 7 days)
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Analytics Overview
        </h2>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toISOString().split("T")[0]}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{recentOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Orders in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Distribution & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {stats.completedOrders}
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 text-xs">
                    {completionRate}%
                  </Badge>
                </div>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {stats.pendingOrders}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 text-xs">
                    {pendingRate}%
                  </Badge>
                </div>
              </div>
              <Progress value={pendingRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {stats.cancelledOrders}
                  </span>
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-800 text-xs">
                    {cancellationRate}%
                  </Badge>
                </div>
              </div>
              <Progress value={cancellationRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(paymentMethods).map(([method, count]) => {
                const percentage = formatPercentage(count, stats.totalOrders);
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {count} orders
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-blue-600">
            {stats.totalOrders}
          </div>
          <div className="text-sm text-blue-600 font-medium">Total Orders</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-green-600">
            {stats.completedOrders}
          </div>
          <div className="text-sm text-green-600 font-medium">Completed</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-yellow-600">
            {stats.pendingOrders}
          </div>
          <div className="text-sm text-yellow-600 font-medium">Pending</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-red-600">
            {stats.cancelledOrders}
          </div>
          <div className="text-sm text-red-600 font-medium">Cancelled</div>
        </div>
      </div>
    </div>
  );
}
