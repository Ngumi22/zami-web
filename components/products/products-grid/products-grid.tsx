"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { Product } from "@prisma/client";
import { ProductGridProps, TabbedGrid } from "./tabbed-grid";
import { ProductCard } from "@/components/admin/product-sections/product-card";

export default function ProductGrid({
  tabs,
  defaultActiveTab,
  className,
  gridCols = { sm: 2, lg: 4 },
  tabPosition = "left",
}: ProductGridProps) {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || tabs[0]?.label || ""
  );

  const activeProducts = useMemo(() => {
    return tabs.find((tab) => tab.label === activeTab)?.products || [];
  }, [activeTab, tabs]);

  const renderProductItem = useCallback(
    (product: Product) => <ProductCard product={product} />,
    []
  );

  const getProductId = useCallback((product: Product) => product.id, []);

  const gridClasses = cn(
    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",
    gridCols.sm && `sm:grid-cols-${gridCols.sm}`,
    gridCols.md && `md:grid-cols-${gridCols.md}`,
    gridCols.lg && `lg:grid-cols-${gridCols.lg}`,
    gridCols.xl && `xl:grid-cols-${gridCols.xl}`
  );

  return (
    <div className={cn("w-full mx-auto", className)}>
      <TabbedGrid<Product>
        tabs={tabs.map((tab) => ({ label: tab.label }))}
        items={activeProducts}
        renderItem={renderProductItem}
        getItemId={getProductId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        gridClasses={gridClasses}
        tabPosition={tabPosition}
      />
    </div>
  );
}
