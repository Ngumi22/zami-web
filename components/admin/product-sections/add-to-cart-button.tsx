"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { type CartItem, useCartStore } from "@/hooks/use-cart";
import { Product } from "@prisma/client";
import { ProductCardActionButton } from "./product-card-action-button";

export function generateCartKey(
  productId: string,
  variants?: Record<string, string>
): string {
  if (!variants || Object.keys(variants).length === 0) return productId;
  const variantKey = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, value]) => `${type}=${value}`)
    .join("&");
  return `${productId}-${variantKey}`;
}

interface AddToCartButtonProps {
  product: Product;
  selectedVariants: Record<string, string>;
  quantity?: number;
  className?: string;
  onAdd?: () => void;
}

export function AddToCartButton({
  product,
  selectedVariants,
  quantity = 1,
  className,
  onAdd,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const variantPriceModifier = Object.entries(selectedVariants).reduce(
    (sum, [type, value]) => {
      const variant = product.variants?.find(
        (v) => v.type === type && v.value === value
      );
      return sum + (variant?.priceModifier || 0);
    },
    0
  );
  const finalPrice = product.price + variantPriceModifier;

  let variantStock = product.stock;
  for (const [type, value] of Object.entries(selectedVariants)) {
    const variant = product.variants?.find(
      (v) => v.type === type && v.value === value
    );
    if (variant && typeof variant.stock === "number") {
      variantStock = Math.min(variantStock, variant.stock);
    }
  }

  const isOutOfStock = variantStock < 1;

  const handleClick = async () => {
    if (isOutOfStock || loading) return;

    setLoading(true);

    const variantSuffix = Object.values(selectedVariants).join(" ");
    const fullName = `${product.name} ${variantSuffix}`.trim();

    const newItem: CartItem = {
      key: generateCartKey(product.id, selectedVariants),
      id: product.id,
      name: fullName,
      slug: product.slug,
      price: finalPrice,
      mainImage: product.mainImage,
      stock: variantStock,
      quantity: quantity,
      variants: selectedVariants,
      categoryId: product.categoryId,
    };

    const result = addItem(newItem);

    if (result.success) {
      onAdd?.();
    }

    setLoading(false);
  };

  return (
    <ProductCardActionButton
      icon={
        loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )
      }
      label={isOutOfStock ? "Out of Stock" : "Add to Cart"}
      onClick={handleClick}
      disabled={isOutOfStock || loading}
      variant="outline"
      className={className}
    />
  );
}
