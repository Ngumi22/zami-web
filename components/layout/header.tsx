"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, RefreshCcw, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MegaMenu } from "./mega-menu/mega-menu";
import { MobileMenu } from "./mobile/mobile-menu";
import { useCartStore } from "@/hooks/use-cart";
import { useCompareStore } from "@/hooks/use-compare";
import { useWishlistStore } from "@/hooks/use-wishlist";
import { InstantSearch } from "../search/search";
import { Brand, Category, Product } from "@prisma/client";

interface SiteHeaderProps {
  categories: Category[];
  products: Product[];
  popularBrands: Brand[];
}

export function SiteHeader({
  categories,
  products,
  popularBrands,
}: SiteHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const cartItemCount = useCartStore((state) => state.items.length);
  const compareItems = useCompareStore((state) => state.items);
  const wishItems = useWishlistStore((state) => state.items);

  // Hide header on certain pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/unauthorized")
  ) {
    return null;
  }

  const navLinks = [
    {
      href: "/",
      label: "Home",
      isActive: pathname === "/",
    },
    {
      href: "/about",
      label: "About",
      isActive: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      isActive: pathname === "/contact",
    },
    {
      href: "/blog",
      label: "Blog",
      isActive: pathname === "/blog",
    },
  ];

  // --- User action links (with icons) ---
  const navItems = [
    {
      href: "/account",
      label: "Account",
      icon: User,
      isActive: pathname === "/account" || pathname.startsWith("/account/"),
    },
    ...(!isMobile
      ? [
          {
            href: "/compare",
            label: "Compare",
            icon: RefreshCcw,
            isActive: pathname === "/compare",
            badge: compareItems.length > 0 ? compareItems.length : undefined,
          },
          {
            href: "/wishlist",
            label: "Wishlist",
            icon: Heart,
            isActive: pathname === "/wishlist",
            badge: wishItems.length > 0 ? wishItems.length : undefined,
          },
          {
            href: "/cart",
            label: "Cart",
            icon: ShoppingCart,
            isActive: pathname === "/cart",
            badge: cartItemCount > 0 ? cartItemCount : undefined,
          },
        ]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        {/* --- Main Header Container --- */}
        <div className="container flex h-20 items-center justify-between">
          {/* --- Left Section: Mobile Menu & Logo --- */}
          <div className="flex items-center gap-6">
            <MobileMenu
              mainCategories={categories}
              subCategories={categories}
              featuredProducts={products}
            />
            <Link prefetch href="/" className="flex items-center">
              <span className="text-xl font-bold">Zami Tech Solutions</span>
            </Link>
          </div>

          {/* --- Center Section: Search & Main Nav (Desktop) --- */}
          {!isMobile && (
            <div className="flex flex-1 items-center justify-center gap-8">
              <div className="w-full max-w-md">
                <InstantSearch products={products} />
              </div>
              <nav className="flex items-center gap-4">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-[#2E2E2E]",
                      item.isActive ? "text-[#2E2E2E]" : "text-[#2E2E2E]/50"
                    )}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* --- Right Section: User Actions --- */}
          <nav className="flex items-center justify-end gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors hover:text-black/50",
                  item.isActive ? "text-[#2E2E2E]" : "text-[#2E2E2E]/50"
                )}>
                <div className="relative">
                  <item.icon className="h-5 w-5 font-semibold text-[#2E2E2E]" />
                  {item.badge && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E2E2E] text-[10px] text-[#2E2E2E]-foreground">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* --- Mega Menu (appears below header) --- */}
        <MegaMenu
          categories={categories}
          featuredProducts={products}
          popularBrands={popularBrands}
        />
      </header>
    </>
  );
}
