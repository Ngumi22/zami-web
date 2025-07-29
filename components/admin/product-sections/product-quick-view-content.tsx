"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { Product } from "@prisma/client";
import { Check, AlertCircle, AlertTriangle } from "lucide-react";
import { BuyNowButton } from "./buy-now-button";
import Link from "next/link";

interface VariantOption {
  label: string;
  value: string;
  priceModifier?: number;
  stock?: number;
}

type ProductQuickViewContentProps = {
  product: Product & {
    category?: {
      name: string;
      specifications?: { name: string; unit?: string }[];
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductQuickViewContent({
  product,
  open,
  onOpenChange,
}: ProductQuickViewContentProps) {
  const LOW_STOCK_THRESHOLD = 5;

  const variantGroups = useMemo(() => {
    const grouped: Record<string, VariantOption[]> = {};
    for (const v of product.variants ?? []) {
      if (!grouped[v.type]) grouped[v.type] = [];
      if (!grouped[v.type].some((o) => o.value === v.value)) {
        grouped[v.type].push({
          label: v.value,
          value: v.value,
          priceModifier: v.priceModifier,
          stock: v.stock,
        });
      }
    }
    return grouped;
  }, [product.variants]);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const defaults: Record<string, string> = {};
    for (const [type, opts] of Object.entries(variantGroups)) {
      if (opts.length) defaults[type] = opts[0].value;
    }
    setSelectedVariants(defaults);
  }, [variantGroups]);

  const { displayPrice, finalStock, stockMessage } = useMemo(() => {
    const priceMod = Object.entries(selectedVariants).reduce(
      (sum, [type, val]) => {
        const v = product.variants?.find(
          (x) => x.type === type && x.value === val
        );
        return sum + (v?.priceModifier || 0);
      },
      0
    );

    let stock = product.stock;
    for (const [type, val] of Object.entries(selectedVariants)) {
      const v = product.variants?.find(
        (x) => x.type === type && x.value === val
      );
      if (typeof v?.stock === "number") {
        stock = Math.min(stock, v.stock);
      }
    }

    let message = "In Stock";
    if (stock === 0) {
      message = "Out of Stock";
    } else if (stock <= LOW_STOCK_THRESHOLD) {
      message = `Low stock! Only ${stock} left.`;
    }

    return {
      displayPrice: product.price + priceMod,
      finalStock: stock,
      stockMessage: message,
    };
  }, [selectedVariants, product.variants, product.price, product.stock]);

  const fullName = `${product.name} ${Object.values(selectedVariants).join(
    " "
  )}`.trim();
  const hasVariants = Object.values(variantGroups).some(
    (opts) => opts.length > 0
  );

  const stockStatus =
    finalStock === 0
      ? {
          icon: <AlertCircle className="h-3 w-3 text-red-500" />,
          color: "text-red-500",
        }
      : finalStock <= LOW_STOCK_THRESHOLD
      ? {
          icon: <AlertTriangle className="h-3 w-3 text-amber-500" />,
          color: "text-amber-500",
        }
      : {
          icon: <Check className="h-3 w-3 text-green-600" />,
          color: "text-green-600",
        };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 h-full">
          <div className="relative bg-muted min-h-[400px]">
            <Image
              src={product.mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </div>

          <div className="px-4 py-2 flex flex-col gap-2 overflow-y-auto">
            <DialogHeader className="p-0 space-y-1 text-left">
              <Badge
                variant="secondary"
                className="w-fit capitalize rounded-none">
                {product.category?.name}
              </Badge>
              <DialogTitle className="font-semibold">{fullName}</DialogTitle>
              <p className="text-sm font-bold text-foreground">
                {formatCurrency(displayPrice)}
              </p>
            </DialogHeader>

            <Separator />

            {Array.isArray(product.specifications) &&
              product.specifications.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Key Features
                  </h4>
                  <div className="space-y-1">
                    {(
                      product.specifications as {
                        name: string;
                        value: string;
                      }[]
                    )
                      .filter((s) => s.value && s.value !== "Not specified")
                      .slice(0, 5)
                      .map((s, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground capitalize">
                            {s.name}
                          </span>
                          <span className="font-medium text-right">
                            {s.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            <Separator />

            {!hasVariants ? (
              <p className="text-xs font-semibold">Product has no variants.</p>
            ) : (
              Object.entries(variantGroups).map(([type, opts]) =>
                opts.length === 0 ? null : (
                  <div key={type} className="space-y-1">
                    <Label className="text-sm font-medium capitalize">
                      {type}
                    </Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {opts.map(({ label, value }) => {
                        const isColor = type.toLowerCase().includes("color");
                        const isSelected = selectedVariants[type] === value;

                        let bgColor = "";
                        let textColor = "";
                        if (isColor) {
                          bgColor = value;
                          textColor =
                            parseInt(value.replace(/^#/, ""), 16) > 0xffffff / 2
                              ? "#000"
                              : "#fff";
                        }

                        return (
                          <Button
                            key={value}
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className={
                              isColor
                                ? "rounded-md flex items-center gap-1"
                                : ""
                            }
                            style={
                              isColor
                                ? { backgroundColor: bgColor, color: textColor }
                                : {}
                            }
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [type]: value,
                              }))
                            }>
                            {isColor && (
                              <span
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: bgColor }}
                                aria-hidden="true"
                              />
                            )}
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )
              )
            )}

            <div className="space-y-1">
              <Label className="text-sm font-medium">Quantity</Label>
              <Input
                type="number"
                min={1}
                max={finalStock}
                value={quantity}
                onChange={(e) => {
                  const v = Math.max(
                    1,
                    Math.min(finalStock, Number(e.target.value) || 1)
                  );
                  setQuantity(v);
                }}
                className="w-20 h-8 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {stockStatus.icon}
              <span className={`text-xs font-medium ${stockStatus.color}`}>
                {stockMessage}
              </span>
            </div>

            <Separator />

            <div className="mt-auto space-y-2">
              <AddToCartButton
                product={product}
                selectedVariants={selectedVariants}
                quantity={quantity}
                className="w-full h-9 text-sm font-medium"
              />
              <BuyNowButton
                product={product}
                selectedVariants={selectedVariants}
                quantity={1}
                className="w-full h-9 text-sm font-medium"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                asChild>
                <Link
                  href={`/products/${product.slug}`}
                  className="w-full h-8 text-xs">
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
