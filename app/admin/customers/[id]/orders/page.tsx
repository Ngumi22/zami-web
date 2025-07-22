import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Eye,
  Package,
  Truck,
  CreditCard,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { OrderSummaryStats } from "@/components/admin/order-sections/order-summary-stats";
import OrderStatusBadge from "@/components/home/order-status-badge";
import { OrderFilters as OrderFiltersComponent } from "@/components/admin/order-sections/order-filters";
import { MobileOrderCard } from "@/components/admin/order-sections/mobile-order-card";
import { OrderFilters } from "@/lib/types";
import { getCustomer } from "@/data/customer";
import { fetchCustomerOrdersData } from "@/data/orders";

interface CustomerOrdersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    limit?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

async function CustomerInfo({ customerId }: { customerId: string }) {
  const customer = await getCustomer(customerId);

  if (!customer) {
    return (
      <div className="text-red-600">
        <p>Failed to load customer information</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
        {customer.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg sm:text-xl font-semibold truncate">
          {customer.name}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground truncate">
          {customer.email}
        </p>
      </div>
    </div>
  );
}

async function OrdersTable({ filters }: { filters: OrderFilters }) {
  const result = await fetchCustomerOrdersData(filters);

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <p className="text-center text-red-600">
            Failed to load orders: {result.error}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { orders, pagination, summary } = result.data;

  if (orders.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <OrderSummaryStats summary={summary} />
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center py-6 sm:py-8">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {filters.search || filters.status !== "all"
                  ? "Try adjusting your search criteria"
                  : "This customer hasn't placed any orders yet"}
              </p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <OrderSummaryStats summary={summary} />

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">
              Orders ({pagination.total})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm bg-transparent">
                <Download className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" className="text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Order</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3 p-4 sm:p-0">
            {orders.map((order) => (
              <MobileOrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline">
                          {order.orderNumber}
                        </Link>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Truck className="h-3 w-3" />
                            <span>{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {order.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="secondary">
                          {order.items.length} items
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index}>
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                      {order.cancelReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {order.cancelReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          <span>{order.paymentMethod}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          ${order.total.toFixed(2)}
                        </div>
                        {order.discount > 0 && (
                          <div className="text-sm text-green-600">
                            -${order.discount.toFixed(2)} discount
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Subtotal: ${order.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          <span>{order.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="h-4 w-4 mr-2" />
                            Track Package
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 sm:px-0">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  asChild>
                  <Link
                    href={`?${new URLSearchParams({
                      ...(filters as any),
                      page: (pagination.page - 1).toString(),
                    }).toString()}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Link>
                </Button>
                <span className="text-xs sm:text-sm px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  asChild>
                  <Link
                    href={`?${new URLSearchParams({
                      ...(filters as any),
                      page: (pagination.page + 1).toString(),
                    }).toString()}`}>
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CustomerOrdersPage({
  params,
  searchParams,
}: CustomerOrdersPageProps) {
  const { id: customerId } = await params;
  const searchParamsData = await searchParams;

  // Verify customer exists
  const customer = await getCustomer(customerId);
  if (!customer) {
    notFound();
  }

  const filters: OrderFilters = {
    customerId,
    search: searchParamsData.search || "",
    status: (searchParamsData.status as any) || "all",
    paymentStatus: (searchParamsData.paymentStatus as any) || "all",
    sortBy: (searchParamsData.sortBy as any) || "createdAt",
    sortOrder: (searchParamsData.sortOrder as any) || "desc",
    page: Number.parseInt(searchParamsData.page || "1"),
    limit: Number.parseInt(searchParamsData.limit || "10"),
    dateFrom: searchParamsData.dateFrom,
    dateTo: searchParamsData.dateTo,
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link href={`/admin/customers/${customerId}`}>
            <Button variant="ghost" size="sm" className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Customer</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">
              Customer Orders
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
              View and manage all orders for this customer
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Suspense fallback={<div>Loading customer info...</div>}>
            <CustomerInfo customerId={customerId} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Filters */}
      <OrderFiltersComponent customerId={customerId} />

      {/* Orders Table */}
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersTable filters={filters} />
      </Suspense>
    </div>
  );
}
