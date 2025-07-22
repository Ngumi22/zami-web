"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { type CartItem, generateCartKey, useCartStore } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface FrequentlyBoughtTogetherProps {
  mainProduct: Product;
  suggestedProducts: Product[];
}

export function FrequentlyBoughtTogether({
  mainProduct,
  suggestedProducts,
}: FrequentlyBoughtTogetherProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    mainProduct.id,
  ]);
  const { toast } = useToast();
  const addItemToCart = useCartStore((state) => state.addItem);

  if (suggestedProducts.length === 0) return null;

  const allProducts = [mainProduct, ...suggestedProducts];
  const selectedProductsData = allProducts.filter((p) =>
    selectedProducts.includes(p.id)
  );

  const totalPrice = selectedProductsData.reduce(
    (sum, product) => sum + product.price,
    0
  );

  const originalTotal = selectedProductsData.reduce(
    (sum, product) => sum + (product.originalPrice || product.price),
    0
  );

  const savings = originalTotal - totalPrice;

  const handleProductToggle = (productId: string) => {
    if (productId === mainProduct.id) return;
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    let failedCount = 0;

    selectedProductsData.forEach((product) => {
      // Determine default variants for the product
      const defaultVariantsMap = new Map<
        string,
        { value: string; priceModifier: number }
      >();

      for (const variant of Array.isArray(product.variants)
        ? product.variants
        : []) {
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
        const variant = Array.isArray(product.variants)
          ? product.variants.find((v) => v.type === type && v.value === value)
          : undefined;
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
        description: `${addedCount} item(s) have been added to your cart.`,
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        Frequently Bought Together
      </h2>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Products */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {allProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  {/* Plus icon for non-first items */}
                  {index > 0 && (
                    <Plus className="w-5 h-5 text-gray-400 hidden sm:block flex-shrink-0" />
                  )}

                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductToggle(product.id)}
                      disabled={product.id === mainProduct.id}
                      className="flex-shrink-0"
                    />

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            product.mainImage ||
                            "/placeholder.svg?height=64&width=64"
                          }
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-blue-600">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatCurrency(product.originalPrice)}
                                </span>
                                <Badge
                                  variant="destructive"
                                  className="text-xs">
                                  Save{" "}
                                  {formatCurrency(
                                    product.originalPrice - product.price
                                  )}
                                </Badge>
                              </>
                            )}
                        </div>
                        {product.id === mainProduct.id && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Main Product
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="lg:w-72 bg-white rounded-lg p-4 border shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total for {selectedProductsData.length} items:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">You save:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(savings)}
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-1">
                  {selectedProductsData.length} of {allProducts.length} items
                  selected
                </div>
              </div>

              <Button
                onClick={handleAddAllToCart}
                className="w-full h-11 font-semibold"
                disabled={selectedProductsData.length === 0}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add Selected to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
