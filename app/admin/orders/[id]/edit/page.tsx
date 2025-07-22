import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOrderById } from "@/data/orders";
import OrderForm from "@/components/admin/order-sections/order-form";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="max-w-full">
        <div className="">
          <h1 className="text-xl font-bold">Edit Order</h1>
          <p className="text-gray-600">Update order information</p>
        </div>

        <OrderForm order={order} />
      </div>
    </Suspense>
  );
}
