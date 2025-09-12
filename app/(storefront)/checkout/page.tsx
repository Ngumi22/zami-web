import CheckoutPageComponent from "@/components/Checkout/CheckoutPage";
import { getCurrentCustomer } from "@/lib/auth/customer-auth";
import { redirect } from "next/navigation";

export default async function Checkoutage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/account/login");
  }

  return <CheckoutPageComponent />;
}
