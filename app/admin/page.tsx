import { Suspense } from "react";
import { RecentOrders } from "@/components/admin/recent-orders";
import { TopProducts } from "@/components/admin/top-products";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickActions } from "@/components/admin/admin-home-sections/quick-actions";
import { SalesChart } from "@/components/admin/admin-home-sections/sales-chart";
import { TrafficMetrics } from "@/components/admin/admin-home-sections/traffic-metrics";
import { InventoryOverview } from "@/components/admin/admin-home-sections/inventory-overview";
import { ConversionMetrics } from "@/components/admin/admin-home-sections/conversion-metrics";
import { AdminStats } from "@/components/admin/admin-home-sections/admin-stats";
import { getAdminStats } from "@/data/adminstats";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <QuickActions />
      </div>

      <AdminStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        <div className="lg:col-span-1">
          <TrafficMetrics />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryOverview />
        <ConversionMetrics />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
