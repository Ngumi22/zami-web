"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCcw,
  Truck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { OrdersAnalytics } from "./orders-analytics";
import { OrdersTable } from "./order-table";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderStatus } from "@prisma/client";
import { getOrdersByStatus } from "@/data/orders";
import { OrderStats } from "@/lib/types";

interface OrdersTabsProps {
  initialOrders: Order[];
  stats: OrderStats;
}

interface TabData {
  orders: Order[];
  loading: boolean;
  loaded: boolean;
}

export function OrdersTabs({ initialOrders, stats }: OrdersTabsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [tabData, setTabData] = useState<Record<string, TabData>>({
    all: { orders: initialOrders, loading: false, loaded: true },
    pending: { orders: [], loading: false, loaded: false },
    completed: { orders: [], loading: false, loaded: false },
    cancelled: { orders: [], loading: false, loaded: false },
    refunded: { orders: [], loading: false, loaded: false },
    delivered: { orders: [], loading: false, loaded: false },
  });

  const statusMap: Record<string, OrderStatus> = {
    pending: OrderStatus.PENDING,
    completed: OrderStatus.COMPLETED,
    cancelled: OrderStatus.CANCELLED,
    refunded: OrderStatus.REFUNDED,
    delivered: OrderStatus.DELIVERED,
  };

  const loadTabData = async (tabId: string) => {
    if (tabData[tabId]?.loaded || tabData[tabId]?.loading) return;

    setTabData((prev) => ({
      ...prev,
      [tabId]: { ...prev[tabId], loading: true },
    }));

    try {
      const orders = await getOrdersByStatus(statusMap[tabId]);

      setTabData((prev) => ({
        ...prev,
        [tabId]: { orders, loading: false, loaded: true },
      }));
    } catch (error) {
      console.error(`Error loading ${tabId} orders:`, error);
      setTabData((prev) => ({
        ...prev,
        [tabId]: { ...prev[tabId], loading: false },
      }));
    }
  };

  useEffect(() => {
    if (activeTab !== "all") loadTabData(activeTab);
  }, [activeTab]);

  const tabs = [
    {
      id: "all",
      label: "All Orders",
      icon: <Package className="w-3 h-3" />,
      count: stats.totalOrders,
      variant: "default" as const,
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      id: "pending",
      label: "Pending",
      icon: <Clock className="w-3 h-3" />,
      count: stats.pendingOrders,
      variant: "secondary" as const,
      badgeColor: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircle className="w-3 h-3" />,
      count: stats.completedOrders,
      variant: "default" as const,
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      id: "delivered",
      label: "Delivered",
      icon: <Truck className="w-3 h-3" />,
      count: stats.deliveredOrders,
      variant: "default" as const,
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: <XCircle className="w-3 h-3" />,
      count: stats.cancelledOrders,
      variant: "destructive" as const,
      badgeColor: "bg-red-100 text-red-700",
    },
    {
      id: "refunded",
      label: "Refunded",
      icon: <RefreshCcw className="w-3 h-3" />,
      count: stats.refundedOrders,
      variant: "destructive" as const,
      badgeColor: "bg-blue-100 text-blue-700",
    },
  ];

  const configMap: Record<
    string,
    { title: string; description: string; status: OrderStatus | "mixed" }
  > = {
    all: {
      title: "All Orders",
      description: "Complete overview of all orders across all statuses",
      status: "mixed",
    },
    pending: {
      title: "Pending Orders",
      description: "Orders awaiting processing and fulfillment",
      status: OrderStatus.PENDING,
    },
    completed: {
      title: "Completed Orders",
      description: "Orders that have been fulfilled and delivered",
      status: OrderStatus.COMPLETED,
    },
    delivered: {
      title: "Delivered Orders",
      description: "Orders that have been delivered",
      status: OrderStatus.DELIVERED,
    },
    cancelled: {
      title: "Cancelled Orders",
      description: "Orders cancelled by customers or admins",
      status: OrderStatus.CANCELLED,
    },
    refunded: {
      title: "Refunded Orders",
      description: "Orders refunded to customers",
      status: OrderStatus.REFUNDED,
    },
  };

  const renderTabContent = (tabId: string) => {
    const data = tabData[tabId];
    if (!data) return null;

    if (data.loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-gray-600" />
          <span className="text-gray-600">Loading {tabId} orders...</span>
        </div>
      );
    }

    const { title, description, status } = configMap[tabId];

    return (
      <div className="space-y-6">
        {tabId === "all" && (
          <div className="bg-white rounded-lg border p-6">
            <OrdersAnalytics stats={stats} orders={data.orders} />
          </div>
        )}

        <div className="bg-white rounded-lg border">
          <OrdersTable
            orders={data.orders}
            status={status}
            title={title}
            description={description}
            showHeader={true}
            enablePagination={true}
            enableFilters={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl font-bold">Order Management</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {stats.totalOrders} total orders
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {formatCurrency(stats.totalRevenue)} revenue
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TooltipProvider delayDuration={200}>
          <TabsList className="grid grid-cols-6 sm:grid-cols-3 md:grid-cols-6 w-full lg:w-auto lg:inline-flex lg:h-12 bg-white border rounded-lg p-1">
            {tabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab.id}
                    className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-0 sm:gap-1 md:gap-2 px-1 md:px-3 py-2 text-xs sm:text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <div className="flex items-center gap-1">
                      {tab.icon}
                      <span className="hidden sm:inline md:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                      <span className="hidden md:inline">{tab.label}</span>
                    </div>

                    <Badge
                      className={`hidden sm:inline text-xs ml-1 ${tab.badgeColor}`}>
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="sm:hidden">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </TooltipProvider>

        <div className="mt-3">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-2">
              {renderTabContent(tab.id)}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
