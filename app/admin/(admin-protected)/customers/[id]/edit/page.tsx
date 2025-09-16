import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCustomer } from "@/data/customer";
import CustomerForm from "@/components/admin/customer-sections/customer-form";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="">
        <div className="mb-2">
          <h1 className="text-xl font-bold">Edit Customer</h1>
          <p className="text-gray-600">Update customer information</p>
        </div>

        <CustomerForm customer={customer} />
      </div>
    </Suspense>
  );
}
