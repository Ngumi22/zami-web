"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/hooks/use-wishlist";
import { ProductCardActionButton } from "./product-card-action-button";
import { Product } from "@prisma/client";

interface AddToWishlistButtonProps {
  product: Product;
  className?: string;
}

export function AddToWishlistButton({
  product,
  className,
}: AddToWishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  return (
    <ProductCardActionButton
      icon={
        <Heart
          className={`h-3 w-3 transition-colors ${
            isWishlisted ? "fill-current text-red-500" : ""
          }`}
        />
      }
      label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      onClick={() => toggleItem(product)}
      isActive={isWishlisted}
      variant={isWishlisted ? "default" : "outline"}
      className={className}
    />
  );
}
