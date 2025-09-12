import { redirect } from "next/navigation";
import {
  getCurrentCustomer,
  getAddresses,
  getOrders,
} from "@/lib/auth/customer-auth";
import CustomerAccountClientPage from "@/components/account/account-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Account | Zami Tech Solutions",
  description: "Manage your account settings, orders, and preferences.",
  robots: "noindex, nofollow",
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/account/login");
  }

  const addresses = await getAddresses(customer);
  const orders = await getOrders(customer);

  const notificationPreferences = {
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    productUpdates: true,
  };

  return (
    <CustomerAccountClientPage
      customer={customer}
      addresses={addresses}
      orders={orders}
      notificationPreferences={notificationPreferences}
    />
  );
}
