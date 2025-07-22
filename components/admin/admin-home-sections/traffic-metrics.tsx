"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Users, Clock, MousePointer } from "lucide-react";

export function TrafficMetrics() {
  // Mock data for demonstration
  const trafficData = {
    totalVisitors: 12543,
    uniqueVisitors: 8921,
    pageViews: 45678,
    avgSessionDuration: "3m 24s",
    bounceRate: 42.3,
    conversionRate: 3.8,
    topSources: [
      { source: "Organic Search", visitors: 4521, percentage: 51 },
      { source: "Direct", visitors: 2890, percentage: 32 },
      { source: "Social Media", visitors: 1034, percentage: 12 },
      { source: "Email", visitors: 476, percentage: 5 },
    ],
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          Website Traffic
        </CardTitle>
        <p className="text-sm text-gray-600">
          Visitor analytics and traffic sources
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-900">
              {formatNumber(trafficData.totalVisitors)}
            </p>
            <p className="text-xs text-purple-600">Total Visitors</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-900">
              {formatNumber(trafficData.pageViews)}
            </p>
            <p className="text-xs text-blue-600">Page Views</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Avg. Session Duration</span>
            </div>
            <Badge variant="outline">{trafficData.avgSessionDuration}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bounce Rate</span>
              <span className="text-sm text-gray-600">
                {trafficData.bounceRate}%
              </span>
            </div>
            <Progress value={trafficData.bounceRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Conversion Rate</span>
              </div>
              <span className="text-sm text-gray-600">
                {trafficData.conversionRate}%
              </span>
            </div>
            <Progress value={trafficData.conversionRate * 10} className="h-2" />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Traffic Sources</h4>
          <div className="space-y-3">
            {trafficData.topSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-xs text-gray-600">
                      {formatNumber(source.visitors)}
                    </span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <p className="text-sm font-medium text-green-700">
            +15.2% increase in traffic this month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
