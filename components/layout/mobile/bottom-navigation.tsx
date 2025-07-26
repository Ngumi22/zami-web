"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingCart, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import { MobileSearch } from "./mobile-search";
import { useWishlistStore } from "@/hooks/use-wishlist";
import { useCompareStore } from "@/hooks/use-compare";
import { useCartStore } from "@/hooks/use-cart";
import { Category, Product } from "@prisma/client";

interface MBottomNavigationProps {
  categories: Category[];
  products: Product[];
}

export function BottomNavigation({
  categories,
  products,
}: MBottomNavigationProps) {
  const pathname = usePathname();

  const wishlistItems = useWishlistStore((state) => state.items);
  const compareItems = useCompareStore((state) => state.items);
  const cartItems = useCartStore((state) => state.items);

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
      href: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/search",
      label: "Search",
      icon: Search,
      isActive: pathname === "/search",
    },
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
      badge: wishlistItems.length > 0 ? wishlistItems.length : undefined,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingCart,
      isActive: pathname === "/cart",
      badge: cartItems.length > 0 ? cartItems.length : undefined,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex items-center justify-around h-16">
      {navItems.map((item) => {
        const isSearch = item.label === "Search";

        if (isSearch) {
          return (
            <div
              key={item.href}
              className="flex-1 flex items-center justify-center h-full">
              <MobileSearch categories={categories} products={products} />
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-full text-xs",
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
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
