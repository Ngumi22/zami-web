"use client";

import { Edit, Eye, Trash2, Package, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { DataTable } from "../data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus } from "@prisma/client";

interface OrdersTableProps {
  orders: Order[];
  status: OrderStatus | "mixed";
  title: string;
  description: string;
  showHeader?: boolean;
  enablePagination?: boolean;
  enableFilters?: boolean;
}

export function OrdersTable({
  orders,
  status,
  title,
  description,
  showHeader = true,
  enableFilters = true,
}: OrdersTableProps) {
  const router = useRouter();

  const getStatusBadge = (orderStatus: OrderStatus) => {
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
      processing: {
        variant: "default" as const,
        className: "bg-blue-100 text-blue-800",
      },
      shipped: {
        variant: "default" as const,
        className: "bg-purple-100 text-purple-800",
      },
      completed: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      cancelled: {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[orderStatus as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.className}>
        {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      paid: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      pending: {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
      failed: {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
      refunded: {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      statusConfig[paymentStatus as keyof typeof statusConfig] ||
      statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    );
  };

  const columns = [
    {
      key: "orderNumber" as keyof Order,
      label: "Order",
      width: "200px",
      render: (value: string, order: Order) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{value}</p>
            <p className="text-sm text-gray-600">{order.customerName}</p>
            <p className="text-xs text-gray-400">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "items" as keyof Order,
      label: "Items",
      hiddenOnBreakpoints: ["sm" as const],
      render: (value: Order["items"]) => (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <p className="font-medium">
              {value.length} item{value.length !== 1 ? "s" : ""}
            </p>
            <p className="text-gray-600">
              {value.reduce((sum, item) => sum + item.quantity, 0)} units
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status" as keyof Order,
      label: "Status",
      sortable: true,
      render: (value: OrderStatus) => getStatusBadge(value),
    },
    {
      key: "paymentStatus" as keyof Order,
      label: "Payment",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      render: (value: string, order: Order) => (
        <div className="space-y-1">
          {getPaymentStatusBadge(value)}
          <p className="text-xs text-gray-600">{order.paymentMethod}</p>
        </div>
      ),
    },
    {
      key: "total" as keyof Order,
      label: "Total",
      sortable: true,
      render: (value: number) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">{formatCurrency(value)}</p>
        </div>
      ),
    },
    {
      key: "shippingAddress" as keyof Order,
      label: "Location",
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      render: (value: Order["shippingAddress"]) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3" />
          <span>
            {value.city}, {value.state}
          </span>
        </div>
      ),
    },
  ];

  if (status === "COMPLETED" && orders.some((o) => o.completedAt)) {
    columns.splice(-1, 0, {
      key: "completedAt" as keyof Order,
      label: "Completed",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      render: (value: string, order: Order) => {
        const date = value ? new Date(value) : undefined;
        return (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{date ? formatDate(date) : "N/A"}</span>
          </div>
        );
      },
    });
  }

  if (status === "CANCELLED" && orders.some((o) => o.cancelReason)) {
    columns.splice(-1, 0, {
      key: "cancelReason" as keyof Order,
      label: "Cancel Reason",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      render: (value: string, order: Order) => (
        <span className="text-sm text-gray-600 truncate max-w-32 block">
          {value || "No reason provided"}
        </span>
      ),
    });
  }

  const actions = [
    {
      label: "View Details",
      onClick: (order: Order) => {
        router.push(`/admin/orders/${order.id}`);
      },
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Edit Order",
      onClick: (order: Order) => {
        router.push(`/admin/orders/${order.id}/edit`);
      },
      icon: <Edit className="w-4 h-4" />,
    },
  ];

  if (status === "PENDING") {
    actions.push({
      label: "Cancel Order",
      onClick: (order: Order) => {
        if (
          confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)
        ) {
          console.log("Cancel order:", order.id);
        }
      },
      icon: <Trash2 className="w-4 h-4" />,
    });
  }

  return (
    <div>
      {showHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {orders.length} orders
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {formatCurrency(
                orders.reduce((sum, order) => sum + order.total, 0)
              )}
              total
            </Badge>
          </div>
        </div>
      )}

      <DataTable
        data={orders}
        columns={columns}
        actions={actions}
        searchable={true}
        filterable={enableFilters}
        selectable={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        onSelectionChange={(selectedOrders: Order[]) =>
          console.log("Selected orders:", selectedOrders)
        }
        onRowClick={(order: Order) => router.push(`/admin/orders/${order.id}`)}
        emptyMessage={`No ${status} orders found.`}
        className="border-0 shadow-none"
      />
    </div>
  );
}
