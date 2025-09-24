"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CartItemSkeleton, EmptyCartIllustration } from "./cart-items-skeleton";
import { useCartStore } from "@/hooks/use-cart-store";

export function CartItems() {
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0
  );

  if (!hasHydrated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-black-200 rounded w-32 animate-pulse dark:bg-black" />
          <div className="h-4 bg-black-200 rounded w-24 animate-pulse dark:bg-black" />
        </div>
        {[...Array(3)].map((_, i) => (
          <CartItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <Card className="border-1 border-black-200">
          <CardContent className="p-12 text-center">
            <EmptyCartIllustration />

            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="font-bold text-black dark:text-black-50">
                Your cart is waiting
              </h2>
              <p className="text-black dark:text-black-400 leading-relaxed">
                Fill your cart with amazing products that you'll love. Start
                exploring our products now.
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <Link href="/products">
                <Button
                  size="lg"
                  className="group rounded-sm"
                  variant="secondary">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:tranblack-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-sm border border-blue-200/50 dark:border-blue-800/50">
            <div>
              <h2 className="text-lg font-bold text-black dark:text-black-50">
                Shopping Cart
              </h2>
              <p className="font-bold text-sm text-black-600 dark:text-black-400">
                {totalItems} {totalItems === 1 ? "item" : "items"} •{" "}
                {formatCurrency(totalPrice)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={() => clearCart()}
                className=" bg-white rounded-sm text-black border border-black hover:bg-red-600 hover:border-red-600 hover:text-white">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
              <Link href="/products">
                <Button
                  className="rounded-sm bg-black text-white hover:outline-1 hover:bg-white hover:text-black"
                  size="sm">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="group rounded-sm">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 relative rounded-sm overflow-hidden bg-black-100 dark:bg-black-800">
                        <Image
                          src={item.mainImage || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="100px"
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      {item.quantity > 1 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-blue-500 hover:bg-blue-600">
                          {item.quantity}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold text-black dark:text-black-50 leading-tight">
                          {item.name}
                        </h3>

                        {/* ✅ Show variant info if available */}
                        {item.variantName && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              key={item.variantId}
                              variant="secondary"
                              className="text-xs rounded-sm">
                              {item.variantName}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-black">
                            {formatCurrency(item.finalPrice)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-black-500 dark:text-black-400">
                              Total:{" "}
                              {formatCurrency(item.finalPrice * item.quantity)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-black-200 dark:border-black rounded-sm bg-black-50 dark:bg-black-800/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 hover:bg-black-200 dark:hover:bg-black">
                              <Minus className="w-3 h-3" />
                            </Button>

                            <span className="w-12 text-center font-semibold text-black dark:text-black-50">
                              {item.quantity}
                            </span>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0 hover:bg-black-200 dark:hover:bg-black">
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.key)}
                            className="h-8 w-8 p-0 text-black-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
