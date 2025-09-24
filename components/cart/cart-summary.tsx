"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { BuyNowButton } from "../admin/product-sections/buy-now-button";
import { useCartStore } from "@/hooks/use-cart-store";
import { applyCoupon } from "@/data/coupons";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0
  );

  const shipping = 0;
  const taxRate = 0.0;
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal - discount + shipping + tax).toFixed(2));

  async function handleApplyCoupon() {
    if (!couponCode) return;

    const res = await applyCoupon(couponCode, subtotal);
    if (res.success) {
      setDiscount(res.amount);
    } else {
      setDiscount(0);
    }
  }

  return (
    <div className="rounded-sm p-4 border-blue-200/50 border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
      <h3 className="font-semibold">Order Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
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
          <Input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Button
            onClick={handleApplyCoupon}
            className="w-full mt-2 bg-black text-white border border-black hover:bg-white hover:text-black">
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
