import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";
import { Order } from "@prisma/client";

export type OrderFilters = {
  customerId: string;
  search?: string;
  status?: Order["status"] | "all";
  paymentStatus?: Order["paymentStatus"] | "all";
  sortBy?: "orderNumber" | "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type OrdersResponse = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: OrderFilters;
  summary: {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    statusCounts: Record<Order["status"], number>;
    paymentStatusCounts: Record<Order["paymentStatus"], number>;
  };
};

interface OrderSummaryStatsProps {
  summary: OrdersResponse["summary"];
}

export function OrderSummaryStats({ summary }: OrderSummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {summary.totalOrders}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              {summary.statusCounts.COMPLETED} completed
            </Badge>
            <Badge variant="outline" className="text-xs">
              {summary.statusCounts.PENDING} pending
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            ${summary.totalValue.toFixed(2)}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className="text-xs text-green-600">
              {summary.paymentStatusCounts.PAID} paid
            </Badge>
            {summary.paymentStatusCounts.REFUNDED > 0 && (
              <Badge variant="outline" className="text-xs text-blue-600">
                {summary.paymentStatusCounts.REFUNDED} refunded
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            ${summary.averageOrderValue.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {summary.statusCounts.PENDING +
              summary.statusCounts.PROCESSING +
              summary.statusCounts.SHIPPED}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {summary.statusCounts.SHIPPED > 0 && (
              <Badge variant="outline" className="text-xs text-purple-600">
                {summary.statusCounts.SHIPPED} shipped
              </Badge>
            )}
            {summary.statusCounts.PROCESSING > 0 && (
              <Badge variant="outline" className="text-xs text-blue-600">
                {summary.statusCounts.PROCESSING} processing
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
