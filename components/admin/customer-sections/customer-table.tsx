"use client";

import { useRouter } from "next/navigation";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { deleteCustomerAction } from "@/lib/customer-actions";
import { formatCurrency } from "@/lib/utils";
import type { Customer, Order } from "@prisma/client";

export type CustomerWithOrders = Customer & {
  orders: Order[];
};

export default function CustomersTable({
  customers,
}: {
  customers: CustomerWithOrders[];
}) {
  const router = useRouter();

  const columns = [
    {
      key: "name" as const,
      label: "Customer",
      sortable: true,
      render: (value: string, customer: CustomerWithOrders) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
      ),
    },
    {
      key: "phone" as const,
      label: "Phone",
      render: (value: string | null) => (
        <span className="text-sm">{value || "—"}</span>
      ),
    },
    {
      key: "orders" as const,
      label: "Orders",
      sortable: false,
      render: (_: any, customer: CustomerWithOrders) => {
        const count = customer.orders?.length ?? 0;
        return (
          <span className="text-sm">
            {count} order{count !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "totalSpent" as const,
      label: "Total Spent",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "joinDate" as const,
      label: "Join Date",
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm">
          {new Date(value).toISOString().split("T")[0]}
        </span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
          {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View Details",
      onClick: (customer: CustomerWithOrders) => {
        router.push(`/admin/customers/${customer.id}`);
      },
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Edit Customer",
      onClick: (customer: CustomerWithOrders) => {
        router.push(`/admin/customers/${customer.id}/edit`);
      },
      icon: <Edit className="w-4 h-4" />,
    },
    {
      label: "Delete Customer",
      onClick: async (customer: CustomerWithOrders) => {
        if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
          await deleteCustomerAction(customer.id);
        }
      },
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ];

  const handleSelectionChange = (selected: CustomerWithOrders[]) => {
    console.log("Selected Customers:", selected);
  };

  const handleRowClick = (customer: CustomerWithOrders) => {
    router.push(`/admin/customers/${customer.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600">Manage customer accounts</p>
        </div>
      </div>

      <DataTable<CustomerWithOrders>
        data={customers}
        columns={columns}
        actions={actions}
        searchable={true}
        filterable={true}
        selectable={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        emptyMessage={"No customers found."}
        className="bg-white"
      />
    </div>
  );
}
