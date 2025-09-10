"use client";

import { signOut } from "@/lib/auth/actions";
import { getCurrentCustomer } from "@/lib/auth/customer-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CustomerDashboard({
  customer,
  recentOrders,
  wishlist,
}: {
  customer: any;
  recentOrders: any;
  wishlist: any;
}) {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {customer.name}!
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentOrders.length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wishlist?.items.length || 0}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Order #{order.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()} - $
                      {order.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/customer/orders"
                className="block text-blue-600 hover:text-blue-800">
                View All Orders
              </a>
              <a
                href="/customer/wishlist"
                className="block text-blue-600 hover:text-blue-800">
                View Wishlist
              </a>
              <a
                href="/customer/addresses"
                className="block text-blue-600 hover:text-blue-800">
                Manage Addresses
              </a>
              <a
                href="/customer/settings"
                className="block text-blue-600 hover:text-blue-800">
                Account Settings
              </a>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Security</h3>
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
        </div>
      </div>
    </div>
  );
}
