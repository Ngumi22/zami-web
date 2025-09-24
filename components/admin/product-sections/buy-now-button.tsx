"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { WhatsappPhoneNumber } from "@/lib/constants";
import type { Product } from "@prisma/client";
import type { CartItem } from "@/hooks/use-cart-store"; // ✅ FIX: use CartItem, not CartReadyProduct

type BuyNowButtonProps = {
  product?: Product;
  selectedVariants?: Record<string, string>;
  quantity?: number;

  cartItems?: CartItem[]; // ✅ FIX: must be CartItem[]
  className?: string;
};

export function BuyNowButton({
  product,
  selectedVariants = {},
  quantity = 1,
  cartItems,
  className = "",
}: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);

  const formatSingle = () => {
    if (!product) return "";
    const variantText = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const variantMod =
      product.variants?.reduce((sum, v) => {
        return (
          sum + ((selectedVariants[v.type] === v.value && v.priceModifier) || 0)
        );
      }, 0) ?? 0;
    const total = (product.price + variantMod) * quantity;
    return `1. ${product.name}${
      variantText ? ` (${variantText})` : ""
    } x${quantity} — ${formatCurrency(total)}`;
  };

  // ✅ FIX: use variantName & quantity from CartItem
  const formatCart = () =>
    (cartItems || [])
      .map((item, i) => {
        return `${i + 1}. ${item.name}${
          item.variantName ? ` (${item.variantName})` : ""
        } x${item.quantity} — ${formatCurrency(
          item.finalPrice * item.quantity
        )}`;
      })
      .join("\n");

  const handleClick = () => {
    setLoading(true);

    let body = "";
    if (cartItems && cartItems.length) {
      body = `Hi! I'm interested in buying these items:\n${formatCart()}`;
    } else if (product) {
      if (product.stock < 1) {
        alert("Sorry, this product is out of stock.");
        setLoading(false);
        return;
      }
      body = `Hi! I'm interested in buying:\n${formatSingle()}`;
    } else {
      setLoading(false);
      return;
    }

    const url = `https://wa.me/${WhatsappPhoneNumber}?text=${encodeURIComponent(
      body
    )}`;
    window.open(url, "_blank");
    setLoading(false);
  };

  const isDisabled =
    loading ||
    (!!cartItems && cartItems.length === 0) ||
    (!cartItems && (!product || product.stock < 1));

  const label = cartItems ? "Order on WhatsApp" : "Buy Now";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleClick}
          disabled={isDisabled}
          variant="outline"
          className={className}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
