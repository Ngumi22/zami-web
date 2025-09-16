import CustomersTable from "@/components/admin/customer-sections/customer-table";
import { getCustomersAndOrders } from "@/data/customer";
import { Suspense } from "react";

export default async function CustomersPage() {
  const customers = await getCustomersAndOrders();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersTable customers={customers} />
    </Suspense>
  );
}
