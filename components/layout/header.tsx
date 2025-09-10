"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MegaMenu } from "./mega-menu/mega-menu";
import { MobileMenu } from "./mobile/mobile-menu";
import { useCartStore } from "@/hooks/use-cart";
import { useCompareStore } from "@/hooks/use-compare";
import { useWishlistStore } from "@/hooks/use-wishlist";
import { InstantSearch } from "../search/search";
import { Brand, Category, Product } from "@prisma/client";
import Image from "next/image";

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

  const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
    </svg>
  );

  const navItems = [
    {
      href: "/account",
      label: "Account",
      icon: UserIcon,
      isActive: pathname === "/account" || pathname.startsWith("/account/"),
    },
    ...(!isMobile
      ? [
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
            badge: wishItems.length > 0 ? wishItems.length : undefined,
          },
          {
            href: "/cart",
            label: "My Cart",
            icon: BagIcon,
            isActive: pathname === "/cart",
            badge: cartItemCount > 0 ? cartItemCount : undefined,
          },
        ]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="lg:container flex items-center justify-between h-20 md:h-24">
          <MobileMenu
            mainCategories={categories}
            subCategories={categories}
            featuredProducts={products}
          />
          <Link prefetch href="/" className="flex items-center h-full">
            <Image
              src={"/logo.png"}
              height={100}
              width={100}
              alt="Zami Tech Solutions"
              className="h-full w-auto object-cover"
            />
          </Link>
          {!isMobile && (
            <div className="flex flex-1 items-center">
              <div className="w-full md:max-w-xs lg:max-w-md mx-auto">
                <InstantSearch products={products} />
              </div>
            </div>
          )}

          <nav className="flex items-center justify-end gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-20 w-16 flex-col items-center justify-center gap-3 rounded-md text-sm font-medium transition-colors hover:text-black/50",
                    item.isActive ? "text-[#2E2E2E]" : "text-[#2E2E2E]/50"
                  )}>
                  <div className="flex flex-col items-center justify-center relative">
                    <Icon className="h-6 w-6 font-semibold text-[#2E2E2E]" />
                    {item.badge && (
                      <span className="absolute -right-1 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E2E2E] text-[10px] text-white">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}

                    <span className="mx-auto text-black text-xs mt-2 font-semibold">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
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
