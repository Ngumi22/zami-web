"use client";

import type React from "react";
import { useEffect, type ReactElement } from "react";
import { useState, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Collection, Product } from "@prisma/client";
import { ProductCard } from "../admin/product-sections/product-card";
import Link from "next/link";

type CollectionWithProduct = Collection & {
  products: Product[];
};

interface CollectionsDisplayProps {
  collections: CollectionWithProduct[];
  className?: string;
}

export function CollectionsDisplay({
  collections,
  className,
}: CollectionsDisplayProps): ReactElement {
  const [activeCollection, setActiveCollection] =
    useState<CollectionWithProduct | null>(collections[0] || null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const filteredItems = useMemo(() => {
    if (!activeCollection) return [];
    return activeCollection.products;
  }, [activeCollection]);

  const handleCollectionChange = useCallback(
    (collection: CollectionWithProduct) => {
      setActiveCollection(collection);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, collection: CollectionWithProduct) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCollectionChange(collection);
      }
    },
    [handleCollectionChange]
  );

  const scrollTabs = useCallback((direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? tabsContainerRef.current.scrollLeft - scrollAmount
          : tabsContainerRef.current.scrollLeft + scrollAmount;

      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  }, []);

  const updateUnderline = useCallback(() => {
    if (tabsRef.current && tabsContainerRef.current && activeCollection) {
      const activeButton = tabsRef.current.querySelector(
        `[data-collection="${activeCollection.id}"]`
      ) as HTMLElement;
      if (activeButton) {
        const containerRect = tabsContainerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const { scrollLeft } = tabsContainerRef.current;

        setUnderlineStyle({
          left: buttonRect.left - containerRect.left + scrollLeft,
          width: buttonRect.width,
        });
      }
    }
  }, [activeCollection]);

  const updateScrollButtons = useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    // Update on scroll
    const handleScroll = () => {
      updateScrollButtons();
      updateUnderline();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    resizeObserverRef.current = new ResizeObserver(() => {
      updateUnderline();
      updateScrollButtons();
    });

    resizeObserverRef.current.observe(container);

    updateUnderline();
    updateScrollButtons();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserverRef.current?.disconnect();
    };
  }, [updateScrollButtons, updateUnderline]);

  useEffect(() => {
    if (activeCollection) {
      requestAnimationFrame(() => {
        updateUnderline();
        updateScrollButtons();
      });
    }
  }, [activeCollection, updateUnderline, updateScrollButtons]);

  const itemCards = useMemo(() => {
    return filteredItems.map((item) => (
      <ProductCard key={item.id} product={item} />
    ));
  }, [filteredItems]);

  if (collections.length === 0) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <section className="space-y-4">
          <div className="text-start space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold text-balance">
              Collections
            </h2>
            <p className="text-muted-foreground text-pretty">
              Explore our curated collections
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No collections available at the moment.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-start space-y-2">
            <h2 className="text-lg md:text-2xl font-semibold text-balance">
              Collections
            </h2>
            <p className="text-muted-foreground text-pretty">
              Explore our curated collections
            </p>
          </div>
          <Link href={"/collections"} className="">
            <Button
              variant="ghost"
              className="shrink-0 bg-transparent hover:underline hover:underline-offset-4">
              See all Collections <ArrowRight className="h-4 w-4 ml-4" />
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="flex items-center">
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => scrollTabs("left")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div
              ref={tabsContainerRef}
              className="flex-1 overflow-x-auto scrollbar-hide mx-8 md:mx-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div
                ref={tabsRef}
                className="flex justify-start md:justify-center gap-6 md:gap-8 relative min-w-max px-2">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    data-collection={collection.id}
                    onClick={() => handleCollectionChange(collection)}
                    onKeyDown={(e) => handleKeyDown(e, collection)}
                    role="tab"
                    aria-selected={activeCollection?.id === collection.id}
                    aria-controls={`items-${collection.id}`}
                    tabIndex={activeCollection?.id === collection.id ? 0 : -1}
                    className={cn(
                      "relative px-3 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      "hover:text-black rounded-sm",
                      activeCollection?.id === collection.id
                        ? "text-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}>
                    {collection.name}
                  </button>
                ))}
                <div
                  className="absolute bottom-0 h-0.5 bg-black rounded-full transition-all duration-200 ease-out"
                  style={{
                    left: `${underlineStyle.left}px`,
                    width: `${underlineStyle.width}px`,
                  }}
                />
              </div>
            </div>

            {canScrollRight && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => scrollTabs("right")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {activeCollection && (
          <div
            id={`items-${activeCollection.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeCollection.id}`}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {itemCards}
          </div>
        )}

        {filteredItems.length === 0 && activeCollection && (
          <div className="text-start py-12">
            <p className="text-muted-foreground">
              No items found in this collection.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
