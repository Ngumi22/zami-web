"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CartItemSkeleton, EmptyCartIllustration } from "./cart-items-skeleton";

export function CartItems() {
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!hasHydrated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse dark:bg-slate-700" />
          <div className="h-4 bg-slate-200 rounded w-24 animate-pulse dark:bg-slate-700" />
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
        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
          <CardContent className="p-12 text-center">
            <EmptyCartIllustration />

            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="font-bold text-slate-900 dark:text-slate-50">
                Your cart is waiting
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Fill yor cart with amazing products that you'll love. Start
                exploring our products collection now.
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <Link href="/products">
                <Button size="lg" className="group" variant="secondary">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Shopping Cart
              </h2>
              <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
                {totalItems} {totalItems === 1 ? "item" : "items"} •{" "}
                {formatCurrency(totalPrice)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCart()}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
              <Link href="/products">
                <Button variant="outline" size="sm">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <Card
                key={item.key}
                className="group hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
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

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                          {item.name}
                        </h3>

                        {item.variants && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(item.variants).map(
                              ([type, value]) => (
                                <Badge
                                  key={type}
                                  variant="secondary"
                                  className="text-xs">
                                  {type}: {value}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.price)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Total:{" "}
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                              <Minus className="w-3 h-3" />
                            </Button>

                            <span className="w-12 text-center font-semibold text-slate-900 dark:text-slate-50">
                              {item.quantity}
                            </span>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.key)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
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
