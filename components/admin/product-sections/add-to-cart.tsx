"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BagIcon } from "@/components/layout/Static/icons";
import { useCartStore, CartReadyProduct } from "@/hooks/use-cart-store";
import { ProductCardData } from "@/data/fetch-all";

type VariantSelection = Record<string, string>;

type AddToCartButtonProps = {
  product: ProductCardData;
  variantSelection?: VariantSelection; // e.g. { Color: "Red", Size: "128GB" }
  mode?: "icon" | "full";
  quantity?: number;
};

export function AddToCartButton({
  product,
  variantSelection = {},
  mode = "icon",
  quantity = 1,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const handleClick = () => {
    // Case 1 → product has variants but none selected → go to product page
    if (product.hasVariants && Object.keys(variantSelection).length === 0) {
      router.push(`/products/${product.slug}`);
      return;
    }

    // Case 2 → compute final price and chosen variant
    let finalPrice = product.price;
    let variantId: string | undefined;
    let variantName: string | undefined;

    for (const [type, value] of Object.entries(variantSelection)) {
      const match = product.variants.find(
        (v) => v.type === type && v.value === value
      );
      if (match) {
        variantId = match.id;
        variantName = `${type}: ${value}`;
        finalPrice += match.priceModifier ?? 0;
      }
    }

    // Build CartReadyProduct (⚡ no quantity here)
    const cartProduct: CartReadyProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      mainImage: product.mainImage,
      stock: product.stock,
      brand: product.brand,
      category: product.category.name,
      basePrice: product.price,
      finalPrice,
      variantId,
      variantName,
    };

    // ✅ Store handles quantity
    const result = addItem(cartProduct, { quantity });
    if (!result.success && result.message) {
      toast(result.message);
    }
  };

  const label =
    product.hasVariants && Object.keys(variantSelection).length === 0
      ? "Choose Options"
      : product.stock <= 0
      ? "Out of Stock"
      : "Add to Cart";

  if (mode === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={product.stock <= 0}>
            <BagIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={product.stock <= 0}
      className="w-full bg-black hover:bg-black">
      {label}
    </Button>
  );
}
