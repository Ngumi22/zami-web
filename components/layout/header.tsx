"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MegaMenu } from "./mega-menu/mega-menu";
import { MobileMenu } from "./mobile/mobile-menu";
import { useCartStore } from "@/hooks/use-cart";
import { useCompareStore } from "@/hooks/use-compare";
import { useWishlistStore } from "@/hooks/use-wishlist";
import { InstantSearch } from "../search/search";
import type { Brand, Category, Product } from "@prisma/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "./cart-sheet";

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
  </svg>
);
const CompareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
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
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.items.length);
  const compareItems = useCompareStore((state) => state.items);
  const wishItems = useWishlistStore((state) => state.items);

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="md:container flex items-center justify-between h-20 md-h-24 px-2 md:px-0">
          <div className="lg:hidden">
            <MobileMenu
              mainCategories={categories}
              subCategories={categories}
              featuredProducts={products}
            />
          </div>

          <Link prefetch href="/" className="flex items-center h-full">
            <Image
              src={"/logo.png"}
              height={100}
              width={100}
              alt="Zami Tech Solutions"
              priority
              className="h-full w-auto object-cover"
            />
          </Link>

          <div className="hidden lg:flex flex-1 items-center">
            <div className="w-full md:max-w-xs lg:max-w-md mx-auto">
              <InstantSearch products={products} />
            </div>
          </div>

          <nav className="flex items-center justify-end gap-2">
            <Link
              href="/account"
              className={cn(
                "flex h-20 w-16 flex-col items-center justify-center gap-3 rounded-md text-sm font-medium transition-colors hover:text-black/50",
                pathname.startsWith("/account")
                  ? "text-[#2E2E2E]"
                  : "text-[#2E2E2E]/50"
              )}>
              <div className="flex flex-col items-center justify-center relative">
                <UserIcon className="h-6 w-6 font-semibold text-[#2E2E2E]" />
                <span className="mx-auto text-black text-xs mt-2 font-semibold">
                  Account
                </span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/compare">
                <div className="flex flex-col items-center justify-center relative">
                  <CompareIcon className="h-6 w-6 font-semibold text-[#2E2E2E]" />
                  {compareItems.length > 0 && (
                    <span className="absolute -right-1 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E2E2E] text-[10px] text-white">
                      {compareItems.length > 9 ? "9+" : compareItems.length}
                    </span>
                  )}
                  <span className="mx-auto text-black text-xs mt-2 font-semibold">
                    Compare
                  </span>
                </div>
              </Link>
              <Link href="/wishlist">
                <div className="flex flex-col items-center justify-center relative">
                  <WishlistIcon className="h-6 w-6 font-semibold text-[#2E2E2E]" />
                  {wishItems.length > 0 && (
                    <span className="absolute -right-1 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E2E2E] text-[10px] text-white">
                      {wishItems.length > 9 ? "9+" : wishItems.length}
                    </span>
                  )}
                  <span className="mx-auto text-black text-xs mt-2 font-semibold">
                    Wishlist
                  </span>
                </div>
              </Link>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "flex h-20 w-16 flex-col items-center justify-center gap-3 rounded-md text-sm font-medium transition-colors hover:text-black/50",
                    pathname === "/cart"
                      ? "text-[#2E2E2E]"
                      : "text-[#2E2E2E]/50"
                  )}>
                  <div className="flex flex-col items-center justify-center relative">
                    <BagIcon className="h-6 w-6 font-semibold text-[#2E2E2E]" />
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E2E2E] text-[10px] text-white">
                        {cartItemCount > 9 ? "9+" : cartItemCount}
                      </span>
                    )}
                    <span className="mx-auto text-black text-xs mt-2 font-semibold">
                      My Cart
                    </span>
                  </div>
                </button>
              </SheetTrigger>
            </div>
          </nav>
        </div>

        <div className="hidden lg:block">
          <MegaMenu
            categories={categories}
            featuredProducts={products}
            popularBrands={popularBrands}
          />
        </div>
      </header>

      <SheetContent className="flex flex-col">
        <CartSheet />
      </SheetContent>
    </Sheet>
  );
}
