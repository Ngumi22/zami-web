import CheckoutConfirmationPage from "@/components/Checkout/CheckoutConfirmationPage";
import { useCartStore } from "@/hooks/use-cart";
import { getCurrentCustomer } from "@/lib/auth/customer-auth";
import { redirect } from "next/navigation";

export default async function ConfirmationPage() {
  const client = await getCurrentCustomer();
  const customerOrder = useCartStore((state) => state.items);

  if (!client) {
    redirect("/account/login");
  }

  return (
    <CheckoutConfirmationPage
      searchParams={{ order: JSON.stringify(customerOrder) }}
    />
  );
}
