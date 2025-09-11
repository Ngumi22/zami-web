"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CategoryTabsProps = {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  isPending: boolean;
};

export default function CategoryBar({
  categories,
  activeCategory,
  onCategoryChange,
  isPending,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScrollPosition();
  }, [categories]);

  return (
    <div className="relative flex items-center py-2 w-full bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm">
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="absolute left-2 z-10 h-9 w-9 p-0 bg-white/90 backdrop-blur-md border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200 rounded-sm">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-scroll scrollbar-hide md:px-12 scroll-smooth snap-x snap-mandatory md:mx-auto"
        onScroll={checkScrollPosition}>
        {categories.map((cat) => (
          <Button
            variant="outline"
            key={cat.slug}
            onClick={() => onCategoryChange(cat.slug)}
            disabled={isPending}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap snap-start border-gray-200/60 hover:border-gray-300 hover:shadow-md",
              activeCategory === cat.slug
                ? "bg-black text-white border-black shadow-lg hover:bg-gray-800"
                : "bg-white/80 backdrop-blur-sm hover:bg-white"
            )}>
            {cat.name}
          </Button>
        ))}
      </div>

      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="absolute right-2 z-10 h-9 w-9 p-0 bg-white/90 backdrop-blur-md border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-200 rounded-sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
