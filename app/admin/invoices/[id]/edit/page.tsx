import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/data/product";
import { getInvoice } from "@/data/invoices";
import { getCustomers } from "@/data/customer";
import InvoiceForm from "@/components/admin/invoices-section/invoice-form";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

async function EditInvoiceFormData({ invoiceId }: { invoiceId: string }) {
  const [invoice, products, customers] = await Promise.all([
    getInvoice(invoiceId),
    getAllProducts(),
    getCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <InvoiceForm
      products={products}
      customers={customers}
      invoice={invoice}
      mode="edit"
    />
  );
}

export default async function EditInvoicePage({
  params,
}: EditInvoicePageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Invoice</h1>
        <p className="text-muted-foreground">
          Update invoice details and items
        </p>
      </div>

      <Suspense fallback={<div>Loading invoice...</div>}>
        <EditInvoiceFormData invoiceId={id} />
      </Suspense>
    </div>
  );
}
