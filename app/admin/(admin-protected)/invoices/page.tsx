import AdminInvoicesTable from "@/components/admin/invoices-section/invoice-table";
import { getAllInvoices } from "@/data/invoices";
import { Suspense } from "react";

export default async function AdminInvoicesPage() {
  const result = await getAllInvoices();
  const invoices = result?.data?.invoices ?? [];
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminInvoicesTable invoices={invoices} />
    </Suspense>
  );
}
