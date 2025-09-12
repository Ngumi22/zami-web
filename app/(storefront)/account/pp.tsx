"use client";

import type React from "react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import dynamic from "next/dynamic";
import ClientSEO from "@/components/client-seo";
import { UserAccountNav } from "@/components/home/user-account-nav";

const OrderStatusBadge = dynamic(
  () => import("@/components/home/order-status-badge"),
  {
    ssr: false,
    loading: () => <Badge variant="outline">Loading...</Badge>,
  }
);

export default function AccountPage() {
  // User data
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    image: "/placeholder.svg?height=40&width=40",
    initials: "JD",
  });

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    productUpdates: true,
  });

  // Address book
  const [addresses, setAddresses] = useState([
    {
      id: "addr1",
      name: "John Doe",
      line1: "123 Main Street",
      line2: "Apt 4B",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      isDefault: true,
      phone: "(555) 123-4567",
    },
    {
      id: "addr2",
      name: "John Doe",
      line1: "456 Market Avenue",
      line2: "",
      city: "Boston",
      state: "MA",
      postalCode: "02118",
      country: "United States",
      isDefault: false,
      phone: "(555) 987-6543",
    },
  ]);

  // Mock orders
  const orders = [
    {
      id: "ORD-1234",
      date: "2023-04-15",
      total: 1099,
      status: "delivered",
      items: 2,
    },
    {
      id: "ORD-1235",
      date: "2023-04-16",
      total: 2499,
      status: "shipped",
      items: 1,
    },
    {
      id: "ORD-1236",
      date: "2023-04-17",
      total: 648,
      status: "processing",
      items: 4,
    },
  ];

  // Account info handlers
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // Toggle notification preferences
  const toggleNotificationPreference = (key: string) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]:
        !notificationPreferences[key as keyof typeof notificationPreferences],
    });
  };

  return (
    <>
      <ClientSEO
        title="Your Account | Zami Tech Solutions"
        description="Manage your account settings, orders, and preferences"
        canonical="/account"
      />
      <>
        <div className="flex-1 container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={user.image || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <UserAccountNav />
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account information and how we contact you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={user.name}
                        onChange={handleUserInfoChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={user.email}
                        onChange={handleUserInfoChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button>Save Changes</Button>
                    </div>
                  </form>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Account Management</h3>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View your recent orders and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{order.id}</h4>
                              <OrderStatusBadge status={order.status} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.date} • {order.items} items
                            </p>
                          </div>
                          <div className="flex items-center mt-2 sm:mt-0">
                            <p className="font-medium mr-4">
                              ${order.total.toFixed(2)}
                            </p>
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/orders/${order.id}`}>View Order</a>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center mt-6">
                        <Button variant="outline" asChild>
                          <a href="/orders">View All Orders</a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        You have no orders yet
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/products">Start Shopping</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle>Address Book</CardTitle>
                  <CardDescription>
                    Manage your shipping and billing addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{address.name}</h4>
                          {address.isDefault && (
                            <Badge variant="outline">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{address.line1}</p>
                          {address.line2 && <p>{address.line2}</p>}
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p>{address.country}</p>
                          <p className="pt-1">{address.phone}</p>
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
                                className="text-destructive hover:bg-destructive/10">
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
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
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control what types of notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your order status
                      </p>
                    </div>
                    <Switch
                      checked={notificationPreferences.orderUpdates}
                      onCheckedChange={() =>
                        toggleNotificationPreference("orderUpdates")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Promotions & Discounts</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about sales and special offers
                      </p>
                    </div>
                    <Switch
                      checked={notificationPreferences.promotions}
                      onCheckedChange={() =>
                        toggleNotificationPreference("promotions")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Newsletter</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive our weekly newsletter
                      </p>
                    </div>
                    <Switch
                      checked={notificationPreferences.newsletter}
                      onCheckedChange={() =>
                        toggleNotificationPreference("newsletter")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Product Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when products on your wishlist are on sale
                      </p>
                    </div>
                    <Switch
                      checked={notificationPreferences.productUpdates}
                      onCheckedChange={() =>
                        toggleNotificationPreference("productUpdates")
                      }
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    </>
  );
}
