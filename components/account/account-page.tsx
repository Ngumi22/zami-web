"use client";
import dynamic from "next/dynamic";
import type React from "react";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  User,
  MapPin,
  CreditCard,
  RotateCcw,
  X,
  Heart,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";
import ClientSEO from "../client-seo";
import {
  Customer as PrismaCustomer,
  CustomerAddress,
  Order,
} from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "@/lib/auth/actions";

export interface CustomerWithRelations extends PrismaCustomer {
  addresses?: CustomerAddress[];
  orders?: Order[];
}

const OrderStatusBadge = dynamic(
  () => import("@/components/home/order-status-badge"),
  {
    ssr: false,
    loading: () => <Badge variant="outline">Loading...</Badge>,
  }
);
export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  productUpdates: boolean;
}

interface CustomerPageProps {
  customer: CustomerWithRelations;
  addresses: CustomerAddress[];
  orders: Order[];
  notificationPreferences: NotificationPreferences;
  onCustomerUpdate?: (customer: CustomerWithRelations) => void;
  onAddressUpdate?: (addresses: CustomerAddress[]) => void;
  onNotificationUpdate?: (preferences: NotificationPreferences) => void;
}

export default function CustomerAccountClientPage({
  customer: initialCustomer,
  orders,
  notificationPreferences: initialNotificationPreferences,
  onCustomerUpdate,
  onAddressUpdate,
  onNotificationUpdate,
}: CustomerPageProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      try {
        await signOut();
      } catch (error) {
        toast.error("An error occurred during sign out.");
      }
    });
  };

  const [customer, setCustomer] =
    useState<CustomerWithRelations>(initialCustomer);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(initialNotificationPreferences);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCustomer = {
      ...customer,
      [e.target.name]: e.target.value,
    };
    setCustomer(updatedCustomer);
    onCustomerUpdate?.(updatedCustomer);
  };

  // Toggle notification preferences
  const toggleNotificationPreference = (key: string) => {
    const updatedPreferences = {
      ...notificationPreferences,
      [key]:
        !notificationPreferences[key as keyof typeof notificationPreferences],
    };
    setNotificationPreferences(updatedPreferences);
    onNotificationUpdate?.(updatedPreferences);
  };

  const getFilteredOrders = () => {
    if (orderStatusFilter === "all") {
      return orders;
    }
    return orders.filter(
      (order) => order.status.toLowerCase() === orderStatusFilter.toLowerCase()
    );
  };

  const orderStatuses = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  const sidebarItems = [
    {
      id: "account",
      label: "Manage My Account",
      isHeader: true,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      parent: "account",
    },
    {
      id: "addresses",
      label: "Address Book",
      icon: MapPin,
      parent: "account",
    },
    {
      id: "payment",
      label: "My Payment Options",
      icon: CreditCard,
      parent: "account",
    },
    {
      id: "orders-header",
      label: "My Orders",
      isHeader: true,
    },
    {
      id: "orders",
      label: "Order History",
      icon: RotateCcw,
      parent: "orders-header",
    },
    {
      id: "returns",
      label: "My Returns",
      icon: RotateCcw,
      parent: "orders-header",
    },
    {
      id: "cancellations",
      label: "My Cancellations",
      icon: X,
      parent: "orders-header",
    },
    {
      id: "wishlist",
      label: "My Wishlist",
      icon: Heart,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Heart,
    },
  ];

  // Helper function to get customer's first and last name
  const getFirstName = () => customer.name.split(" ")[0] || "";
  const getLastName = () => customer.name.split(" ").slice(1).join(" ") || "";

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-red-600 mb-6">
                Edit Your Profile
              </h2>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={getFirstName()}
                      onChange={(e) => {
                        const lastName = getLastName();
                        const fullName = `${e.target.value} ${lastName}`.trim();
                        handleCustomerInfoChange({
                          target: { name: "name", value: fullName },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={getLastName()}
                      onChange={(e) => {
                        const firstName = getFirstName();
                        const fullName =
                          `${firstName} ${e.target.value}`.trim();
                        handleCustomerInfoChange({
                          target: { name: "name", value: fullName },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customer.email}
                    onChange={handleCustomerInfoChange}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={customer.phone || ""}
                    onChange={handleCustomerInfoChange}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <select
                    id="address"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select an address</option>
                    {customer.addresses?.map((address: CustomerAddress) => {
                      const addressString = `${address.addressLine1}${
                        address.addressLine2 ? ", " + address.addressLine2 : ""
                      }, ${address.city}, ${address.state}, ${address.country}`;
                      return (
                        <option key={address.id} value={addressString}>
                          {addressString} {address.isDefault ? "(Default)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password Changes</h3>
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-password"
                      className="text-sm font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );

      case "addresses":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">
              Address Book
            </h2>
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
                    {address.phone && <p className="pt-1">{address.phone}</p>}
                    {address.preferredCourier && (
                      <p className="pt-1 text-xs">
                        <span className="font-medium">Preferred Courier:</span>{" "}
                        {address.preferredCourier}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button size="sm" variant="outline">
                          Set as Default
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 bg-transparent">
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )) || (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No addresses found</p>
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
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">
              My Payment Options
            </h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No payment methods added yet
              </p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700">
                Add Payment Method
              </Button>
            </div>
          </div>
        );

      case "returns":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">
              My Returns
            </h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No returns found</p>
            </div>
          </div>
        );

      case "cancellations":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">
              My Cancellations
            </h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cancelled orders found</p>
            </div>
          </div>
        );

      case "wishlist":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">
              My Wishlist
            </h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700">
                Start Shopping
              </Button>
            </div>
          </div>
        );

      case "orders":
        const filteredOrders = getFilteredOrders();
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-0">
                Order History
              </h2>
              <div className="flex flex-wrap gap-2">
                {orderStatuses.map((status) => (
                  <Button
                    key={status.value}
                    variant={
                      orderStatusFilter === status.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setOrderStatusFilter(status.value)}
                    className={cn(
                      "text-xs px-3 py-1 h-8",
                      orderStatusFilter === status.value
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}>
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {order.orderNumber}
                        </h4>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600">
                        <span>
                          Order Date:{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </span>
                        {order.trackingNumber && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>Tracking: {order.trackingNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          ${order.total.toFixed(2)}
                        </p>
                        {order.paymentStatus && (
                          <p className="text-xs text-gray-500 capitalize">
                            {order.paymentStatus}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1 h-8 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        asChild>
                        <a href={`/orders/${order.id}`}>View Details</a>
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredOrders.length >= 5 && (
                  <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      asChild>
                      <a href="/orders">View All Orders</a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                <div className="max-w-sm mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {orderStatusFilter === "all"
                      ? "No orders found"
                      : `No ${orderStatusFilter} orders`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {orderStatusFilter === "all"
                      ? "You haven't placed any orders yet"
                      : `You don't have any orders with ${orderStatusFilter} status`}
                  </p>
                  {orderStatusFilter !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrderStatusFilter("all")}
                      className="mb-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                      View All Orders
                    </Button>
                  )}
                  <div>
                    <Button
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                      asChild>
                      <a href="/products">Start Shopping</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Order Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your order status
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.orderUpdates}
                  onChange={() => toggleNotificationPreference("orderUpdates")}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Promotions & Discounts</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about sales and special offers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.promotions}
                  onChange={() => toggleNotificationPreference("promotions")}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Newsletter</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive our weekly newsletter
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.newsletter}
                  onChange={() => toggleNotificationPreference("newsletter")}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Product Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when products on your wishlist are on sale
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences.productUpdates}
                  onChange={() =>
                    toggleNotificationPreference("productUpdates")
                  }
                  className="h-4 w-4"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-red-600 hover:bg-red-700">
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ClientSEO
        title="Your Account | Zami Tech Solutions"
        description="Manage your account settings, orders, and preferences"
        canonical="/account"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>Home</span>
                <ChevronRight className="h-4 w-4" />
                <Button
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="w-full bg-red-600 text-white hover:bg-red-700">
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Sign Out"
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Welcome!</span>
                <span className="text-sm text-red-600 font-medium">
                  {customer.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    if (item.isHeader) {
                      return (
                        <div key={item.id} className="py-2">
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                            {item.label}
                          </h3>
                        </div>
                      );
                    }

                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
                          isActive
                            ? "bg-red-50 text-red-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50",
                          item.parent && "ml-4"
                        )}>
                        {Icon && <Icon className="h-4 w-4" />}
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
