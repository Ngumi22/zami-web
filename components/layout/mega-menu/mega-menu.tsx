"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCategoryBar } from "./mobile-category-bar";
import { MegaMenuDropdown } from "./mega-menu-dropdown";
import { Brand, Category, Product } from "@prisma/client";

interface MegaMenuProps {
  categories: Category[];
  featuredProducts: Product[];
  popularBrands: Brand[];
}

export function MegaMenu({
  categories,
  popularBrands,
  featuredProducts,
}: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const specialSections = [
    { id: "deals", name: "Deals", href: "/deals" },
    { id: "new-arrivals", name: "New Arrivals", href: "/new-arrivals" },
    { id: "top-rated", name: "Top Rated", href: "/top-rated" },
    { id: "blog", name: "Blog", href: "/blog" },
  ];

  useEffect(() => {
    if (!activeCategory) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeCategory]);

  useEffect(() => {
    if (!activeCategory) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCategory(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [activeCategory]);

  const handleMouseEnter = (categoryId: string) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }

    openTimeout.current = setTimeout(() => {
      setActiveCategory(categoryId);
    }, 200); // open delay
  };

  const handleMouseLeave = () => {
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = null;
    }

    closeTimeout.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200); // close delay
  };

  if (isMobile) {
    return (
      <MobileCategoryBar
        categories={categories}
        specialSections={specialSections}
      />
    );
  }

  return (
    <div className="bg-muted border-b relative" ref={menuRef}>
      <div className="container">
        <nav className="flex items-center justify-center overflow-x-auto scrollbar-hide">
          {categories
            .filter((category) => category.parentId === null) // Only main categories
            .map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    activeCategory === category.id
                      ? "text-primary"
                      : "hover:text-primary"
                  )}
                  onClick={() => setActiveCategory(null)}>
                  {category.name}
                  <ChevronDown
                    className={cn(
                      "ml-1 h-4 w-4 transition-transform",
                      activeCategory === category.id && "rotate-180"
                    )}
                  />
                </Link>
              </div>
            ))}

          {/* Special sections */}
          {specialSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap hover:text-primary transition-colors">
              {section.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mega menu dropdown */}
      {activeCategory && (
        <div
          onMouseEnter={() => handleMouseEnter(activeCategory)}
          onMouseLeave={handleMouseLeave}>
          <MegaMenuDropdown
            category={categories.find((c) => c.id === activeCategory)!}
            subcategories={categories.filter(
              (c) => c.parentId === activeCategory
            )}
            featuredProducts={featuredProducts.filter((product) => {
              const subcategoryIds = categories
                .filter((c) => c.parentId === activeCategory)
                .map((c) => c.id);

              return (
                product.categoryId === activeCategory ||
                subcategoryIds.includes(product.categoryId)
              );
            })}
            popularBrands={popularBrands}
            onClose={() => setActiveCategory(null)}
          />
        </div>
      )}
    </div>
  );
}
