"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@prisma/client";

type ProductQuickViewContentProps = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantGroups: Record<string, { label: string; value: string }[]>;
  basePrice: number;
  className?: string;
};

const ProductQuickViewContent = dynamic<ProductQuickViewContentProps>(
  () =>
    import("./product-quick-view-content").then(
      (mod) => mod.ProductQuickViewContent
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-2 w-full">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export function QuickViewTrigger({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  const variantGroups: Record<
    string,
    { label: string; value: string; priceModifier?: number }[]
  > = {};

  product.variants?.forEach((variant) => {
    if (!variantGroups[variant.type]) {
      variantGroups[variant.type] = [];
    }

    if (!variantGroups[variant.type].some((v) => v.value === variant.value)) {
      variantGroups[variant.type].push({
        label: variant.value,
        value: variant.value,
        priceModifier: variant.priceModifier,
      });
    }
  });

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}>
        Quick View
      </Button>
      {open && (
        <ProductQuickViewContent
          product={product}
          open={open}
          onOpenChange={setOpen}
          variantGroups={variantGroups}
          basePrice={product.price}
        />
      )}
    </>
  );
}
