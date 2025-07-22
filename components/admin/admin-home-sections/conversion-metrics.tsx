"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, ShoppingCart } from "lucide-react";

export function ConversionMetrics() {
  // Mock data for demonstration
  const conversionData = {
    overallConversion: 3.8,
    funnelSteps: [
      { step: "Visitors", count: 12543, percentage: 100, color: "bg-blue-500" },
      {
        step: "Product Views",
        count: 8921,
        percentage: 71,
        color: "bg-green-500",
      },
      {
        step: "Add to Cart",
        count: 2156,
        percentage: 17,
        color: "bg-yellow-500",
      },
      { step: "Checkout", count: 892, percentage: 7, color: "bg-orange-500" },
      { step: "Purchase", count: 476, percentage: 3.8, color: "bg-red-500" },
    ],
    topPerformers: [
      { page: "iPhone 15 Pro", conversions: 89, rate: 12.4 },
      { page: "MacBook Pro", conversions: 67, rate: 9.8 },
      { page: "Samsung Galaxy", conversions: 45, rate: 8.2 },
      { page: "Dell XPS", conversions: 34, rate: 7.1 },
    ],
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          Conversion Metrics
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sales funnel and conversion analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Conversion Rate */}
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-900">
            {conversionData.overallConversion}%
          </p>
          <p className="text-sm text-orange-600">Overall Conversion Rate</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">+0.8% from last month</span>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Conversion Funnel
          </h4>
          <div className="space-y-2">
            {conversionData.funnelSteps.map((step, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{step.step}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatNumber(step.count)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {step.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${step.color} transition-all duration-500`}
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Top Converting Products
          </h4>
          <div className="space-y-2">
            {conversionData.topPerformers.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      #{index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{product.page}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {product.conversions}
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 text-xs">
                    {product.rate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-blue-900">71%</p>
            <p className="text-xs text-blue-600">View Rate</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <ShoppingCart className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-900">17%</p>
            <p className="text-xs text-green-600">Cart Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
