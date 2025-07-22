"use client";

import { BarChart2 } from "lucide-react";
import { useCompareStore } from "@/hooks/use-compare";
import { ProductCardActionButton } from "./product-card-action-button";
import { Product } from "@prisma/client";

interface AddToCompareButtonProps {
  product: Product;
  className?: string;
}

export function AddToCompareButton({
  product,
  className,
}: AddToCompareButtonProps) {
  const { toggleItem, isInCompare } = useCompareStore();
  const isCompared = isInCompare(product.id);

  return (
    <ProductCardActionButton
      icon={<BarChart2 className="h-4 w-4" />}
      label={isCompared ? "Remove from Compare" : "Add to Compare"}
      onClick={() => toggleItem(product)}
      isActive={isCompared}
      variant={isCompared ? "default" : "outline"}
      className={className}
    />
  );
}
