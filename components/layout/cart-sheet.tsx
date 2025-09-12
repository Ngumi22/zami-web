"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const totalItems = items.length;

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      <SheetHeader>
        <SheetTitle>Shopping Cart ({totalItems})</SheetTitle>
      </SheetHeader>
      <Separator className="my-4" />

      {items.length > 0 ? (
        <div className="flex h-full flex-col justify-between">
          <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded">
                    <Image
                      src={item.mainImage || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    <p>{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-6">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button asChild variant="outline">
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </SheetFooter>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center space-y-2">
          <p className="text-lg font-medium">Your cart is empty</p>
          <Button asChild variant="link">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </>
  );
}
