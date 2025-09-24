"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Product } from "@prisma/client";
import { ProductCardData } from "@/data/product";

export interface TabData {
  label: string;
  products: ProductCardData[];
}

export interface ProductGridProps {
  tabs: TabData[];
  defaultActiveTab?: string;
  className?: string;
  maxWidth?: string;
  gridCols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  tabPosition?: "left" | "center" | "right";
}

interface Tab {
  label: string;
}

interface TabbedGridProps<T> {
  tabs: Tab[];
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getItemId: (item: T) => string | number;
  activeTab: string;
  onTabChange: (tabLabel: string) => void;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
  gridClasses?: string;
  tabPosition?: "left" | "center" | "right";
}

export function TabbedGrid<T>({
  tabs,
  items,
  renderItem,
  getItemId,
  activeTab,
  onTabChange,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  className,
  gridClasses = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",
  tabPosition = "left",
}: TabbedGridProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.label === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  const positionClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex w-full flex-wrap gap-6 mb-8 border-b",
          positionClasses[tabPosition]
        )}>
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            onClick={() => onTabChange(tab.label)}
            className={cn(
              "pb-3 text-sm font-medium transition-colors duration-150 whitespace-nowrap",
              activeTab === tab.label
                ? "text-black"
                : "text-muted-foreground hover:text-black"
            )}>
            {tab.label}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-out"
          style={indicatorStyle}
        />
      </div>

      <div className={gridClasses}>
        {items.map((item) => (
          <div key={getItemId(item)}>{renderItem(item)}</div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        {isLoading && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
        {!isLoading && hasMore && (
          <Button variant="outline" onClick={onLoadMore}>
            Load More
          </Button>
        )}
        {!isLoading && items.length === 0 && (
          <p className="text-muted-foreground">No items to display.</p>
        )}
      </div>
    </div>
  );
}
