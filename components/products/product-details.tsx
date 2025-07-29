"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Plus,
  Minus,
  Check,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddToWishlistButton } from "../admin/product-sections/add-to-wishlist-button";
import { AddToCompareButton } from "../admin/product-sections/add-to-compare-button";
import { AddToCartButton } from "../admin/product-sections/add-to-cart-button";
import type { Product } from "@prisma/client";
import Link from "next/link";
import { ProductImageGallery } from "./product-image-gallery";
import { BuyNowButton } from "../admin/product-sections/buy-now-button";

interface VariantOption {
  label: string;
  value: string;
  priceModifier?: number;
  stock?: number;
}

interface ProductDetailsProps {
  product: Product & {
    reviews?: {
      id: string;
      rating: number;
      comment: string;
      customer: { name: string };
      createdAt: Date;
    }[];
    mappedSpecifications?: { name: string; value: string }[];
  };
}

// Compact components
const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-300"
          }`}
        />
      ))}
    </div>
    <span className="text-xs text-slate-600 dark:text-slate-400">
      ({reviewCount})
    </span>
  </div>
);

const StockIndicator = ({ stockMessage }: { stockMessage: string }) => {
  const isOutOfStock = stockMessage === "Out of Stock";
  const isLowStock = stockMessage.toLowerCase().includes("low stock");

  const icon = isOutOfStock ? (
    <AlertCircle className="h-3 w-3 text-red-500" />
  ) : isLowStock ? (
    <AlertTriangle className="h-3 w-3 text-amber-500" />
  ) : (
    <Check className="h-3 w-3 text-green-600" />
  );

  const textColor = isOutOfStock
    ? "text-red-500"
    : isLowStock
    ? "text-amber-500"
    : "text-green-600";

  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className={`text-xs font-medium ${textColor}`}>{stockMessage}</span>
    </div>
  );
};

const PriceDisplay = ({
  displayPrice,
  originalPrice,
}: {
  displayPrice: number;
  originalPrice?: number | null;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
      {formatCurrency(displayPrice)}
    </span>
    {originalPrice && (
      <>
        <span className="text-sm text-slate-500 line-through">
          {formatCurrency(originalPrice)}
        </span>
        <Badge variant="destructive" className="text-xs px-1 py-0">
          Save {formatCurrency(originalPrice - displayPrice)}
        </Badge>
      </>
    )}
  </div>
);

const VariantSelector = ({
  type,
  options,
  selectedValue,
  onSelect,
}: {
  type: string;
  options: VariantOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) => {
  const isColor = type.toLowerCase().includes("color");

  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold capitalize">{type}</Label>
      <div className="flex gap-1 flex-wrap">
        {options.map(({ label, value, stock }) => {
          const isSelected = selectedValue === value;
          const isOutOfStock = typeof stock === "number" && stock <= 0;
          const backgroundColor = isColor ? value : "";
          const textColor =
            isColor && /^#?([a-f\d]{6})$/i.test(value)
              ? Number.parseInt(value.replace(/^#/, ""), 16) > 0xffffff / 2
                ? "#000"
                : "#fff"
              : undefined;

          return (
            <Button
              key={value}
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onSelect(value)}
              disabled={isOutOfStock}
              className={`relative h-7 px-2 text-xs ${
                isOutOfStock ? "opacity-50" : ""
              } ${isColor ? "gap-1" : ""}`}
              style={isColor ? { backgroundColor, color: textColor } : {}}>
              {isColor && (
                <span
                  className="w-2 h-2 rounded-full border"
                  style={{ backgroundColor }}
                />
              )}
              {label}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-0.5 bg-red-500 rotate-45" />
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

const QuantitySelector = ({
  quantity,
  onIncrement,
  onDecrement,
  onChange,
  totalPrice,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (value: number) => void;
  totalPrice: number;
}) => (
  <div className="space-y-1">
    <Label className="text-xs font-semibold">Quantity</Label>
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDecrement}
          disabled={quantity <= 1}
          className="h-8 w-8 p-0">
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            onChange(Math.max(1, Number.parseInt(e.target.value) || 1))
          }
          className="w-12 h-8 text-center border-0 focus-visible:ring-0 text-xs"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onIncrement}
          className="h-8 w-8 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Total: {formatCurrency(totalPrice)}
      </span>
    </div>
  </div>
);

const TrustBadges = () => {
  const badges = [
    { icon: "🚚", title: "Free Shipping", subtitle: "Over Ksh 70k" },
    { icon: "🛡️", title: "1Yr Warranty", subtitle: "Coverage" },
    { icon: "↩️", title: "14Day Returns", subtitle: "Easy" },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 pt-2 border-t">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center space-y-1">
          <div className="text-sm">{badge.icon}</div>
          <div>
            <p className="text-xs font-medium">{badge.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {badge.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductTabs = ({
  product,
}: {
  product: ProductDetailsProps["product"];
}) => (
  <Tabs defaultValue="description" className="w-full">
    <TabsList className="grid w-full grid-cols-3 h-8">
      <TabsTrigger value="description" className="text-xs">
        Description
      </TabsTrigger>
      <TabsTrigger value="reviews" className="text-xs">
        Reviews ({product.reviewCount || 0})
      </TabsTrigger>
      <TabsTrigger value="shipping" className="text-xs">
        Shipping
      </TabsTrigger>
    </TabsList>

    <TabsContent value="description" className="mt-2">
      <Card>
        <CardContent className="p-3">
          <div
            className="prose prose-sm prose-slate dark:prose-invert max-w-none text-xs"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="reviews" className="mt-2">
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Reviews</h3>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent">
                Write Review
              </Button>
            </div>
            {product.reviewCount > 0 && (product.reviews?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {product.reviews?.slice(0, 2).map((review) => (
                  <div key={review.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} reviewCount={0} />
                      <span className="text-xs font-medium">
                        {review.customer.name}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No reviews yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="shipping" className="mt-2">
      <Card>
        <CardContent className="p-3">
          <h3 className="text-sm font-semibold mb-2">Shipping</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { title: "Standard", desc: "5-7 days • Free Ksh 70k+" },
              { title: "Express", desc: "2-3 days • ksh 1k" },
              { title: "Overnight", desc: "Next day • Ksh 500" },
              { title: "International", desc: "7-14 days • Varies" },
            ].map((option, index) => (
              <div
                key={index}
                className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center">
                <h4 className="text-xs font-medium mb-1">{option.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {option.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

// Custom hook for product logic
const useProductLogic = (product: ProductDetailsProps["product"]) => {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    product.mainImage,
    ...(product.thumbnailImages || []),
  ].filter(Boolean);

  const variantGroups = useMemo(() => {
    const grouped: Record<string, VariantOption[]> = {};
    for (const variant of product.variants ?? []) {
      if (!grouped[variant.type]) grouped[variant.type] = [];
      if (!grouped[variant.type].some((v) => v.value === variant.value)) {
        grouped[variant.type].push({
          label: variant.value,
          value: variant.value,
          priceModifier: variant.priceModifier,
          stock: variant.stock,
        });
      }
    }
    return grouped;
  }, [product.variants]);

  useEffect(() => {
    const defaults: Record<string, string> = {};
    for (const [type, options] of Object.entries(variantGroups)) {
      if (options.length > 0) {
        defaults[type] = options[0].value;
      }
    }
    setSelectedVariants(defaults);
  }, [variantGroups]);

  const { displayPrice, stockMessage, originalPrice } = useMemo(() => {
    const variantPriceModifier = Object.entries(selectedVariants).reduce(
      (sum, [type, value]) => {
        const variant = product.variants?.find(
          (v) => v.type === type && v.value === value
        );
        return sum + (variant?.priceModifier || 0);
      },
      0
    );

    let finalStock = product.stock;
    for (const [type, value] of Object.entries(selectedVariants)) {
      const variant = product.variants?.find(
        (v) => v.type === type && v.value === value
      );
      if (variant && typeof variant.stock === "number") {
        finalStock = Math.min(finalStock, variant.stock);
      }
    }

    const inStock = finalStock > 0;
    let message = `In Stock (${finalStock})`;
    if (!inStock) message = "Out of Stock";
    else if (finalStock <= 5) message = `Low stock! ${finalStock} left`;

    return {
      displayPrice: product.price + variantPriceModifier,
      originalPrice:
        variantPriceModifier !== 0 ? product.originalPrice ?? null : null,
      stockMessage: message,
    };
  }, [selectedVariants, product.variants, product.price, product.stock]);

  const fullName = `${product.name} ${Object.values(selectedVariants).join(
    " "
  )}`.trim();

  return {
    selectedVariants,
    setSelectedVariants,
    quantity,
    setQuantity,
    productImages,
    variantGroups,
    displayPrice,
    originalPrice,
    stockMessage,
    fullName,
    incrementQuantity: () => setQuantity((prev) => prev + 1),
    decrementQuantity: () => setQuantity((prev) => Math.max(1, prev - 1)),
  };
};

// Main component
export function ProductDetails({ product }: ProductDetailsProps) {
  const {
    selectedVariants,
    setSelectedVariants,
    quantity,
    setQuantity,
    productImages,
    variantGroups,
    displayPrice,
    originalPrice,
    stockMessage,
    fullName,
    incrementQuantity,
    decrementQuantity,
  } = useProductLogic(product);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Product Images */}
        <ProductImageGallery
          images={productImages}
          productName={product.slug}
        />

        {/* Product Info */}
        <div className="space-y-2">
          {/* Header */}
          <div className="space-y-2">
            <div>
              <h1 className="text-sm lg:text-lg font-bold text-slate-900 dark:text-slate-50 mb-1 leading-tight">
                {fullName}
              </h1>
              <StarRating
                rating={product.averageRating || 0}
                reviewCount={product.reviewCount || 0}
              />
            </div>
            <PriceDisplay
              displayPrice={displayPrice}
              originalPrice={originalPrice}
            />
            <StockIndicator stockMessage={stockMessage} />
          </div>

          <Separator className="my-2" />

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
            {product.shortDescription}
          </p>

          {/* Key Features */}
          {product.mappedSpecifications &&
            product.mappedSpecifications.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold">Features</h4>
                <div className="space-y-1">
                  {product.mappedSpecifications
                    .filter(
                      (spec) => spec.value && spec.value !== "Not specified"
                    )
                    .slice(0, 3)
                    .map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-xs">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        <span className="text-slate-600 capitalize">
                          {spec.name}:
                        </span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          <Separator className="my-2" />

          {/* Variants */}
          <div className="space-y-2">
            {Object.entries(variantGroups).map(([type, options]) => (
              <VariantSelector
                key={type}
                type={type}
                options={options}
                selectedValue={selectedVariants[type]}
                onSelect={(value) =>
                  setSelectedVariants((prev) => ({ ...prev, [type]: value }))
                }
              />
            ))}
          </div>

          <QuantitySelector
            quantity={quantity}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
            onChange={setQuantity}
            totalPrice={displayPrice * quantity}
          />

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <AddToCartButton
                product={product}
                selectedVariants={selectedVariants}
                quantity={quantity}
                className="w-full h-8 text-xs font-semibold"
              />
              <AddToWishlistButton
                product={product}
                className="w-full h-8 text-xs font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <AddToCompareButton
                product={product}
                className="w-full h-8 text-xs font-semibold"
              />
              <BuyNowButton
                product={product}
                selectedVariants={selectedVariants}
                quantity={quantity}
                className="w-full h-8 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-slate-600">Tags:</span>
              {product.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  href={`/products?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors capitalize">
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <TrustBadges />
        </div>
      </div>

      {/* Tabs */}
      <ProductTabs product={product} />
    </div>
  );
}
