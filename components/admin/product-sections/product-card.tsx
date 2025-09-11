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
        unit?: string | null;
      }[];
    };
    brand?: {
      name: string;
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
  const displayOriginalPrice = product.originalPrice
    ? product.originalPrice + displayPriceModifier
    : null;

  // Check if product has discount
  const hasDiscount =
    displayOriginalPrice && displayOriginalPrice > displayPrice;

  // Calculate discount percentage
  const discountPercentage =
    hasDiscount && displayOriginalPrice
      ? Math.round(
          ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
        )
      : 0;

  const selectedVariants = Object.fromEntries(
    Array.from(defaultVariantsMap.entries()).map(([type, { value }]) => [
      type,
      value,
    ])
  );

  return (
    <div className="group relative overflow-hidden rounded-sm border shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="relative w-full aspect-square overflow-hidden flex-shrink-0">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10">
          <span className="sr-only">View {displayName}</span>
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-black px-2 text-white text-xs">
              - {discountPercentage}%
            </span>
          </div>
        )}

        <Image
          src={
            product.mainImage ||
            "/placeholder.svg?height=125&width=125&query=product"
          }
          alt={displayName}
          fill
          priority={priority}
          sizes="(max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw"
          className="object-contain p-2 transition-transform duration-300 scale-90 group-hover:scale-105"
        />

        {product.stock < 10 && product.stock > 0 && (
          <span className="text-sm text-red-600 p-1.5 rounded whitespace-nowrap absolute bottom-2 left-2 bg-red-50 font-bold">
            Only {product.stock} left
          </span>
        )}

        {showQuickView && !isMobile && <QuickViewTrigger product={product} />}

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

      <div className="flex flex-col flex-1 justify-between p-1">
        <div className="flex-1">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-medium line-clamp-1 text-sm leading-tight min-h-[1rem] hover:text-black/80 transition-colors">
              {displayName}
            </h3>
          </Link>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground line-clamp-1 capitalize">
              {product.brand?.name}
            </p>
            {hasVariants && (
              <span className="text-xs text-muted-foreground block">
                {variantTypes.size} Option{variantTypes.size > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">
              {formatCurrency(displayPrice)}
            </span>
            <div className="hidden lg:block">
              {hasDiscount && displayOriginalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(displayOriginalPrice)}
                </span>
              )}
            </div>
          </div>

          {!isMobile && (
            <div className="relative z-20">
              <AddToCartButton
                product={product}
                selectedVariants={selectedVariants}
                quantity={1}
              />
            </div>
          )}

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
  );
}
