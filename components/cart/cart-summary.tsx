"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { BuyNowButton } from "../admin/product-sections/buy-now-button";

export function CartSummary() {
  const items = useCartStore((state) => state.items);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = 0;
  const taxRate = 0.0;
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  return (
    <div className="rounded-xl p-4 border-blue-200/50 border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
      <h3 className="font-semibold">Order Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>Ksh {tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex flex-col gap-2 space-y-2 mt-2">
          <Input placeholder="Coupon code" />
          <Button className="w-full mt-2 bg-black text-white border border-black hover:bg-white hover:text-black">
            Apply Coupon
          </Button>
        </div>
        <BuyNowButton
          cartItems={items}
          className="w-full h-9 text-sm font-medium"
        />
        <Link href={items.length > 0 ? "/checkout" : "#"} passHref>
          <Button
            className="w-full mt-2 bg-white text-black border border-black hover:bg-black hover:text-white"
            size="lg"
            disabled={items.length === 0}>
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
