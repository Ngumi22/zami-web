"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  Eye,
  Target,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdminStatsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    conversionGrowth: number;
    totalProducts: number;
    lowStockProducts: number;
    pageViews: number;
    bounceRate: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-3 h-3 text-green-600" />
    ) : (
      <TrendingDown className="w-3 h-3 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const statsData = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: <DollarSign className="w-5 h-5" />,
      color: "border-l-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: formatNumber(stats.totalOrders),
      growth: stats.ordersGrowth,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "border-l-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Customers",
      value: formatNumber(stats.totalCustomers),
      growth: stats.customersGrowth,
      icon: <Users className="w-5 h-5" />,
      color: "border-l-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(1)}%`,
      growth: stats.conversionGrowth,
      icon: <Target className="w-5 h-5" />,
      color: "border-l-orange-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const secondaryStats = [
    {
      title: "Total Products",
      value: formatNumber(stats.totalProducts),
      icon: <Package className="w-4 h-4" />,
      badge: null,
    },
    {
      title: "Low Stock Items",
      value: formatNumber(stats.lowStockProducts),
      icon: <Package className="w-4 h-4" />,
      badge:
        stats.lowStockProducts > 0 ? (
          <Badge variant="destructive" className="text-xs">
            Attention needed
          </Badge>
        ) : null,
    },
    {
      title: "Page Views",
      value: formatNumber(stats.pageViews),
      icon: <Eye className="w-4 h-4" />,
      badge: null,
    },
    {
      title: "Bounce Rate",
      value: `${stats.bounceRate.toFixed(1)}%`,
      icon: <TrendingDown className="w-4 h-4" />,
      badge:
        stats.bounceRate > 60 ? (
          <Badge variant="secondary" className="text-xs">
            High
          </Badge>
        ) : (
          <Badge
            variant="default"
            className="text-xs bg-green-100 text-green-800">
            Good
          </Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className={`border-l-4 ${stat.color} hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${getGrowthColor(
                  stat.growth
                )}`}>
                {getGrowthIcon(stat.growth)}
                <span>{formatPercentage(stat.growth)} from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {secondaryStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-gray-600">{stat.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                  </div>
                </div>
                {stat.badge && stat.badge}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
