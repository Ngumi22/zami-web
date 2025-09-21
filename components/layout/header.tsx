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
import { BagIcon, CompareIcon, UserIcon, WishlistIcon } from "./Static/icons";

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

          <Link prefetch href="/" className="flex items-center h-full p-4">
            <Image
              src={"/logo.svg"}
              height={100}
              width={100}
              alt="Zami Tech Solutions"
              priority
              className="h-full w-auto object-cover"
            />
          </Link>

          <div className="hidden lg:flex flex-1 items-center">
            <div className="w-full lg:max-w-xs md:max-w-md mx-auto">
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

        <div className="hidden md:block">
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
