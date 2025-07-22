"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCarouselProps {
  title?: string;
  viewAllHref?: string;
  className?: string;
  children: React.ReactNode;
}

export function ProductCarousel({
  title,
  viewAllHref,
  className,
  children,
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isMobile = useIsMobile();

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(
      hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth
    );
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    const newScrollLeft =
      direction === "left"
        ? el.scrollLeft - scrollAmount
        : el.scrollLeft + scrollAmount;

    el.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    checkScrollability();
  };

  // Track touch events for swipe gestures on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollRight) {
      scroll("right");
    } else if (isRightSwipe && canScrollLeft) {
      scroll("left");
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className={cn("relative", className)}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-sm font-medium text-primary hover:underline">
              View all
            </a>
          )}
        </div>
      )}

      <div className="relative">
        {/* Left scroll button - only on desktop */}
        {!isMobile && canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md border-muted opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}>
          {children}
        </div>

        {/* Right scroll button - only on desktop */}
        {!isMobile && canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md border-muted opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export function ProductCarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex-shrink-0 snap-start",
        "w-full",
        "sm:w-1/2",
        "md:w-1/3",
        "lg:w-1/4",
        "xl:w-1/5",
        className
      )}>
      {children}
    </div>
  );
}
