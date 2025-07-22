import { Suspense } from "react";
import { getAllProducts } from "@/data/product";
import { getCustomers } from "@/data/customer";
import InvoiceForm from "@/components/admin/invoices-section/invoice-form";

export default async function NewInvoicePage() {
  const [products, customers] = await Promise.all([
    getAllProducts(),
    getCustomers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Create New Invoice</h1>
        <p className="text-muted-foreground">Generate a new invoice.</p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <InvoiceForm mode="create" products={products} customers={customers} />
      </Suspense>
    </div>
  );
}
