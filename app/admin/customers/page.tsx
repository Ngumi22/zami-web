import CustomersTable from "@/components/admin/customer-sections/customer-table";
import { getCustomersWithOrders } from "@/data/customer";
import { Suspense } from "react";

export default async function CustomersPage() {
  const customers = await getCustomersWithOrders();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersTable customers={customers} />
    </Suspense>
  );
}
