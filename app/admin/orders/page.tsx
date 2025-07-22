import { Suspense } from "react";
import { OrdersTabs } from "@/components/admin/order-sections/orders-tabs";
import { OrdersPageSkeleton } from "@/components/admin/order-sections/order-page-skeleton";
import { getAllOrders, getOrderStats } from "@/data/orders";

export default async function OrdersPage() {
  const [orders, stats] = await Promise.all([getAllOrders(), getOrderStats()]);
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersTabs initialOrders={orders} stats={stats} />
    </Suspense>
  );
}
