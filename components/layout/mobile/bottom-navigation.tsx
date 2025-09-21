"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const CompareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
      />
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
    </svg>
  );

  const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
    </svg>
  );

  const WishlistIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16">
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
    </svg>
  );

  const BagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16">
      <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
    </svg>
  );

  const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16">
      <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
    </svg>
  );

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: HomeIcon,
      isActive: pathname === "/",
    },
    {
      href: "/search",
      label: "Search",
      icon: SearchIcon,
      isActive: pathname === "/search",
    },
    {
      href: "/compare",
      label: "Compare",
      icon: CompareIcon,
      isActive: pathname === "/compare",
      badge: compareItems.length > 0 ? compareItems.length : undefined,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: WishlistIcon,
      isActive: pathname === "/wishlist",
      badge: wishlistItems.length > 0 ? wishlistItems.length : undefined,
    },
    {
      href: "/cart",
      label: "My Cart",
      icon: BagIcon,
      isActive: pathname === "/cart",
      badge: cartItems.length > 0 ? cartItems.length : undefined,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex items-center justify-around h-16">
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
              item.isActive ? "text-[#2E2E2E]" : "text-[#2E2E2E]/50"
            )}>
            <div className="relative">
              <item.icon className="h-5 w-5 mb-1" />
              {item.badge && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E2E2E] text-[10px] text-white">
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
