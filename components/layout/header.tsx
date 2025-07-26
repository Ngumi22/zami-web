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
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/unauthorized")
  ) {
    return null;
  }

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
      <header className="sticky top-0 z-40 w-full bg-background">
        <div className="border-b">
          <div className="md:container grid grid-flow-col gap-2 items-center h-20">
            <MobileMenu
              mainCategories={categories}
              subCategories={categories}
              featuredProducts={products}
            />

            <Link prefetch href="/" className="flex items-center">
              <span className="text-xl font-bold text-center">
                Zami Tech Solutions
              </span>
            </Link>

            <div className="flex text-center">
              {!isMobile && <InstantSearch products={products} />}
            </div>

            <div className="flex flex-1 items-center justify-end md:pr-0 pr-3">
              <div className="flex justify-between items-center gap-x-5 md:gap-x-10">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-full text-xs",
                      item.isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                    <div className="relative">
                      <item.icon className="h-5 w-5 mb-1" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden md:block">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <MegaMenu
          categories={categories}
          featuredProducts={products}
          popularBrands={popularBrands}
        />
      </header>
    </>
  );
}
