"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";

interface MobileCategoryBarProps {
  categories: Category[];
  specialSections: Array<{ id: string; name: string; href: string }>;
  className?: string;
}

export function MobileCategoryBar({
  categories,
  specialSections,
  className,
}: MobileCategoryBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get("category");

  const mainCategories = categories.filter(
    (category) => category.parentId === null
  );

  const allLinks = [
    ...mainCategories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      href: `/products?category=${category.slug}`,
      isActive: currentCategory === category.id,
      featured: false,
    })),
    ...specialSections.map((section) => ({
      ...section,
      isActive: pathname === section.href,
      featured: section.id === "deals" || section.id === "new-arrivals",
    })),
  ];

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const activeItem = allLinks.findIndex((link) => link.isActive);
    if (activeItem !== -1 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const item = container.children[activeItem] as HTMLElement;

      if (item) {
        const containerWidth = container.offsetWidth;
        const itemWidth = item.offsetWidth;
        const scrollPosition =
          item.offsetLeft - containerWidth / 2 + itemWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }

    checkScrollPosition();

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      return () =>
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
    }
  }, [pathname, searchParams, categories, specialSections]);

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "hidden md:block bg-background border-b relative",
        className
      )}>
      <div className="container px-0 relative">
        {showLeftScroll && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-10 px-1 flex items-center justify-center bg-gradient-to-r from-background to-background/80"
            aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className={cn(
            "flex overflow-x-auto py-3 px-4 gap-3",
            "scroll-smooth scrollbar-hide",
            "scroll-snap-type-x mandatory",
            "scroll-pl-4 scroll-pr-4"
          )}
          style={{
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "1rem",
            scrollPaddingRight: "1rem",
          }}>
          {allLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                "flex-shrink-0 px-4 py-2 text-sm font-medium",
                "transition-all duration-200 scroll-snap-align-start",
                "border shadow-sm",
                link.isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : link.featured
                  ? "bg-secondary/50 border-secondary/50 hover:bg-secondary hover:border-secondary"
                  : "bg-card hover:bg-accent/80"
              )}
              style={{ scrollSnapAlign: "start" }}>
              {link.name}
            </Link>
          ))}
        </div>

        {showRightScroll && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-10 px-1 flex items-center justify-center bg-gradient-to-l from-background to-background/80"
            aria-label="Scroll right">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
