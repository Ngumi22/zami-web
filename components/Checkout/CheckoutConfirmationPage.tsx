import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/data/orders";
import { authClient } from "@/lib/auth/auth.client";

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams?.order;

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No order found</h1>
          <p className="text-muted-foreground mb-6">
            It looks like you haven’t placed an order.
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { data: customerSession } = await authClient.getSession();

  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-full bg-primary/10 p-4 mx-auto w-fit mb-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your order has been confirmed and will
            be shipped soon.
          </p>

          <div className="border rounded-lg p-6 mb-8 text-left">
            <h2 className="font-medium mb-4">Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>
                  {customerSession?.user?.email ?? "customer@example.com"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span>{order.paymentMethod ?? "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={`/account/orders/${order.id}`}>View Order</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
