import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  MessageCircle,
  MoreHorizontal,
  ArrowLeft,
  ExternalLink,
  User,
  Clock,
  Package,
  Truck,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { CustomerDetailSkeleton } from "@/components/admin/customer-sections/customer-detail-skeleton";
import OrderStatusBadge from "@/components/home/order-status-badge";
import { formatCurrency } from "@/lib/utils";
import { getCustomerWithOrders } from "@/data/customer";

import { CustomerAddress, PaymentStatus } from "@prisma/client";

interface CustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerWithOrders(id);
  console.log(customer?.id);

  if (!customer) {
    notFound();
  }

  const recentOrders = customer.orders?.slice(0, 5) || [];
  const completedOrders =
    customer.orders?.filter((order) => order.status === "COMPLETED") || [];
  const avgOrderValue =
    completedOrders.length > 0
      ? customer.totalSpent / completedOrders.length
      : 0;
  const daysSinceJoin = Math.floor(
    (Date.now() - customer.joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const pendingOrders =
    customer.orders?.filter(
      (order) => order.status === "PENDING" || order.status === "PROCESSING"
    ).length || 0;

  return (
    <Suspense fallback={<CustomerDetailSkeleton />}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Customer Profile
              </h1>
              <p className="text-muted-foreground">
                Manage customer information and view order history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Package className="h-4 w-4 mr-2" />
                  Create Order
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Deactivate Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hero Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{customer.name}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Customer since {customer.joinDate.toLocaleDateString()}
                    </span>
                    <Badge variant="secondary">{daysSinceJoin} days</Badge>
                  </div>
                </div>
              </div>
              <StatusBadge
                status={customer.status === "ACTIVE" ? "active" : "inactive"}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={customer.orders?.length || 0}
            icon={ShoppingCart}
            trend={
              pendingOrders > 0
                ? { value: pendingOrders, isPositive: true }
                : undefined
            }
          />
          <StatCard
            title="Total Spent"
            value={`${formatCurrency(customer.totalSpent)}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Avg Order Value"
            value={`${formatCurrency(avgOrderValue)}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Completed Orders"
            value={completedOrders.length}
            icon={Package}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Details & Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer.email}</span>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {customer.phone && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{customer.phone}</span>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {customer.addresses?.map((address: CustomerAddress) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{address.fullName}</h4>
                        {address.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.city}, {address.state}
                        </p>
                        <p>{address.country}</p>
                        {address.phone && (
                          <p className="pt-1">{address.phone}</p>
                        )}
                        {address.preferredCourier && (
                          <p className="pt-1 text-xs">
                            <span className="font-medium">
                              Preferred Courier:
                            </span>{" "}
                            {address.preferredCourier}
                          </p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-muted-foreground">
                        No addresses found
                      </p>
                    </div>
                  )}
                  <div className="border rounded-lg border-dashed p-4 flex flex-col items-center justify-center text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed flex items-center justify-center mb-3">
                      <span className="text-2xl">+</span>
                    </div>
                    <h4 className="font-medium">Add New Address</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a new shipping or billing address
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <Link href={`/admin/customers/${customer.id}/orders`}>
                  <Button variant="ghost" size="sm">
                    View All ({customer.orders?.length || 0})
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <div key={order.id}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="font-medium hover:underline">
                                {order.orderNumber}
                              </Link>
                              <OrderStatusBadge status={order.status} />
                              <PaymentStatusBadge
                                status={
                                  order.paymentStatus.toUpperCase() as PaymentStatus
                                }
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {order.createdAt.toLocaleDateString()}
                              </span>
                              <span>
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {order.paymentMethod}
                              </span>
                              {order.trackingNumber && (
                                <span className="flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  {order.trackingNumber}
                                </span>
                              )}
                            </div>
                            {order.notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Note: {order.notes}
                              </p>
                            )}
                            {order.cancelReason && (
                              <p className="text-sm text-red-600">
                                Cancelled: {order.cancelReason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(order.total)}
                            </div>
                            {order.discount > 0 && (
                              <div className="text-sm text-green-600">
                                -{formatCurrency(order.discount)} discount
                              </div>
                            )}
                          </div>
                        </div>
                        {index < recentOrders.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found for this customer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Account Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
                <Separator />
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Status</span>
                  <StatusBadge
                    status={
                      customer.status === "ACTIVE" ? "active" : "inactive"
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer Since</span>
                  <span className="text-sm">
                    {customer.joinDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Orders</span>
                  <span className="text-sm font-semibold">
                    {customer.orders?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed Orders</span>
                  <span className="text-sm font-semibold">
                    {completedOrders.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Orders</span>
                  <span className="text-sm font-semibold">{pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lifetime Value</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {customer.id}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
