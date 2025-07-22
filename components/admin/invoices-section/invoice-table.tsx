"use client";

import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Invoice } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { Plus, Eye, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminInvoicesTable({
  invoices,
}: {
  invoices: Invoice[];
}) {
  const router = useRouter();
  const columns = [
    {
      key: "id" as const,
      label: "Invoice ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "orderNumber" as const,
      label: "Order",
      sortable: true,
      render: (value: string) => (
        <Link
          href={`/admin/orders/${value}`}
          className="text-blue-600 hover:underline">
          {value}
        </Link>
      ),
    },
    {
      key: "customer" as const,
      label: "Customer",
      sortable: true,
      render: (_: any, invoice: Invoice) => (
        <div className="flex flex-col">
          <span className="font-semibold">{invoice.customer.name}</span>
          <span className="text-sm text-gray-500">
            {invoice.customer.email}
          </span>
        </div>
      ),
    },
    {
      key: "total" as const,
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "paymentStatus" as const,
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "paid"
              ? "bg-green-100 text-green-800"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : value === "overdue"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "dueDate" as const,
      label: "Due Date",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toISOString().split("T")[0]}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View Details",
      onClick: (invoice: Invoice) => {
        router.push(`/admin/invoices/${invoice.id}`);
      },
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Edit Invoice",
      onClick: (invoice: Invoice) => {
        router.push(`/admin/invoices/${invoice.id}/edit`);
      },
      icon: <Send className="w-4 h-4" />,
    },

    {
      label: "Delete Invoice",
      onClick: (invoice: Invoice) => {
        if (confirm(`Are you sure you want to delete "${invoice.customer}"?`)) {
          console.log("Delete Invoice:", invoice);
          // Implement delete API call here
        }
      },
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ];

  const handleSelectionChange = (selectedInvoices: Invoice[]) => {
    console.log("Selected Invoices:", selectedInvoices);
    // Implement bulk actions here
  };

  const handleRowClick = (invoice: Invoice) => {
    router.push(`/admin/invoices/${invoice.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Invoices</h1>
          <p className="text-gray-600 text-sm">Manage Invoice invoices</p>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        actions={actions}
        searchable={true}
        filterable={true}
        selectable={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        emptyMessage={"No Invoices found."}
        className="bg-white"
      />
    </div>
  );
}
