"use client";

import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { type ProductWithRelations } from "@/hooks/use-compare";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "../admin/product-sections/add-to-cart-button";

export function MobileProductCard({
  product,
  onRemove,
}: {
  product: ProductWithRelations;
  onRemove: () => void;
}) {
  const defaultVariantsMap = new Map<
    string,
    { value: string; priceModifier: number }
  >();

  return (
    <Card className="relative mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
        onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-4">
        <div className="text-center">
          <Image
            src={
              product.mainImage ||
              "/placeholder.svg?height=120&width=120&query=product"
            }
            alt={product.name}
            width={120}
            height={120}
            className="mx-auto mb-3 object-contain rounded-lg"
          />
          <h3 className="mb-2">{product.name}</h3>

          <p className="mb-4 font-bold">{formatCurrency(product.price)}</p>
          <AddToCartButton
            product={product}
            selectedVariants={Object.fromEntries(
              Array.from(defaultVariantsMap.entries()).map(
                ([type, { value }]) => [type, value]
              )
            )}
            quantity={1}
            className="flex-1 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
