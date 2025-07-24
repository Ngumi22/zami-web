"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddToWishlistButton } from "./add-to-wishlist-button";
import { AddToCompareButton } from "./add-to-compare-button";
import { AddToCartButton } from "./add-to-cart-button";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@prisma/client";
import { BuyNowButton } from "./buy-now-button";

const QuickViewTrigger = dynamic(
  () =>
    import("./product-quick-view").then((mod) => ({
      default: mod.QuickViewTrigger,
    })),
  { ssr: false }
);

type ProductCardProps = {
  product: Product & {
    category?: {
      name: string;
      specifications?: {
        name: string;
        unit?: string;
      }[];
    };
  };
  showQuickView?: boolean;
  priority?: boolean;
};

export function ProductCard({
  product,
  showQuickView = true,
  priority = false,
}: ProductCardProps) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultVariantsMap = new Map<
    string,
    { value: string; priceModifier: number }
  >();

  for (const variant of product.variants || []) {
    if (!defaultVariantsMap.has(variant.type)) {
      defaultVariantsMap.set(variant.type, {
        value: variant.value,
        priceModifier: variant.priceModifier ?? 0,
      });
    }
  }

  const variantTypes = new Set(product.variants?.map((v) => v.type));
  const hasVariants = variantTypes.size > 0;

  let variantSuffix = "";
  let displayPriceModifier = 0;
  for (const [, { value, priceModifier }] of defaultVariantsMap) {
    variantSuffix += ` ${value}`;
    displayPriceModifier += priceModifier;
  }

  const displayName = `${product.name}${variantSuffix}`.trim();
  const displayPrice = product.price + displayPriceModifier;
  const selectedVariants = Object.fromEntries(
    Array.from(defaultVariantsMap.entries()).map(([type, { value }]) => [
      type,
      value,
    ])
  );

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background shadow-sm hover:shadow-lg transition-shadow duration-300 w-full h-[340px] flex flex-col">
      <div className="relative w-full h-60 overflow-hidden bg-muted flex-shrink-0">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10">
          <span className="sr-only">View {displayName}</span>
        </Link>
        <Image
          src={
            product.mainImage ||
            "/placeholder.svg?height=250&width=250&query=product"
          }
          alt={displayName}
          fill
          priority={priority}
          sizes="250px"
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        />

        {product.stock < 10 && product.stock > 0 && (
          <span className="text-sm text-red-600 p-1.5 rounded whitespace-nowrap absolute bottom-2 left-2 bg-red-50 font-bold">
            Only {product.stock} left
          </span>
        )}

        {showQuickView && !isMobile && <QuickViewTrigger product={product} />}
        {/* Desktop hover overlay */}
        {!isMobile && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 justify-center items-end px-2 z-20">
            <AddToCompareButton product={product} />
            <AddToWishlistButton product={product} />
            <BuyNowButton
              product={product}
              selectedVariants={selectedVariants}
              quantity={1}
            />
          </div>
        )}

        {/* Mobile overlay - always visible, no hover required */}
        {isMobile && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent flex flex-col gap-1.5 justify-center items-end px-2 z-20">
            <AddToWishlistButton product={product} />
            <AddToCompareButton product={product} />
            <AddToCartButton
              product={product}
              selectedVariants={selectedVariants}
              quantity={1}
            />
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col flex-1 justify-between">
        <div className="flex-1">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-medium line-clamp-2 text-sm leading-tight min-h-[2rem] hover:text-blue-600 transition-colors">
              {displayName}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground line-clamp-1 capitalize">
              {product.category?.name}
            </p>
            {hasVariants && (
              <span className="text-xs text-muted-foreground mt-1 block">
                {variantTypes.size} Variant{variantTypes.size > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-bold">
                {formatCurrency(displayPrice)}
              </span>
            </div>

            {/* Desktop: Single cart button */}
            {!isMobile && (
              <div className="relative z-20">
                <AddToCartButton
                  product={product}
                  selectedVariants={selectedVariants}
                  quantity={1}
                />
              </div>
            )}

            {/* Mobile: Only Buy Now button at bottom, others on image overlay */}
            {isMobile && (
              <div className="flex items-center justify-end relative z-30">
                <BuyNowButton
                  product={product}
                  selectedVariants={selectedVariants}
                  quantity={1}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
