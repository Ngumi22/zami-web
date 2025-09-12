"use client";

import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem, generateCartKey, useCartStore } from "@/hooks/use-cart";
import { ProductCard } from "../admin/product-sections/product-card";
import { useWishlistStore } from "@/hooks/use-wishlist";

export function WishlistContent() {
  const { toast } = useToast();
  const { items, clearAll } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddAllToCart = () => {
    if (items.length === 0) return;

    let addedCount = 0;
    let failedCount = 0;

    items.forEach((product) => {
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

      const selectedVariants: Record<string, string> = {};
      let variantSuffix = "";
      let variantPriceModifier = 0;
      for (const [type, { value, priceModifier }] of defaultVariantsMap) {
        selectedVariants[type] = value;
        variantSuffix += ` ${value}`;
        variantPriceModifier += priceModifier;
      }

      const finalPrice = product.price + variantPriceModifier;
      const fullName = `${product.name}${variantSuffix}`.trim();

      let variantStock = product.stock;
      for (const [type, value] of Object.entries(selectedVariants)) {
        const variant = product.variants?.find(
          (v) => v.type === type && v.value === value
        );
        if (variant && typeof variant.stock === "number") {
          variantStock = Math.min(variantStock, variant.stock);
        }
      }

      const cartItemToAdd: CartItem = {
        key: generateCartKey(product.id, selectedVariants),
        id: product.id,
        name: fullName,
        slug: product.slug,
        price: finalPrice,
        mainImage: product.mainImage,
        stock: variantStock,
        quantity: 1,
        variants: selectedVariants,
        categoryId: product.categoryId,
      };

      const result = addItemToCart(cartItemToAdd);
      if (result.success) {
        addedCount++;
      } else {
        failedCount++;
      }
    });

    if (addedCount > 0) {
      toast({
        title: "Items Added to Cart",
        description: `${addedCount} item(s) from your wishlist have been added to your cart.`,
      });
    }
    if (failedCount > 0) {
      toast({
        title: "Some Items Not Added",
        description: `${failedCount} item(s) could not be added due to stock limitations.`,
        variant: "destructive",
      });
    }
  };

  const handleClearWishlist = () => {
    if (items.length > 0) {
      clearAll();
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-gray-600 mb-6">
          Start adding products you love to your wishlist.
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-gray-600">
          {items.length} item{items.length !== 1 ? "s" : ""} in your wishlist
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddAllToCart}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
          <Button variant="destructive" onClick={handleClearWishlist}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
