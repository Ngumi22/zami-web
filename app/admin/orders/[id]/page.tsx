import { notFound } from "next/navigation";
import { OrderDisplay } from "@/components/admin/order-sections/order-display";
import { Suspense } from "react";
import { getOrderWithCustomer } from "@/data/orders";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrderWithCustomer(id);

  if (!order) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6">
        <OrderDisplay order={order} />
      </div>
    </Suspense>
  );
}
