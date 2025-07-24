"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Category, Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface MobileMenuProps {
  mainCategories: Category[];
  subCategories: Category[];
  featuredProducts: Product[];
}

export function MobileMenu({
  mainCategories,
  subCategories,
  featuredProducts,
}: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (open && mainCategories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(mainCategories[mainCategories.length - 1].id);
    }
  }, [open, mainCategories, activeCategoryId]);

  if (pathname.startsWith("/admin")) return null;

  const specialLinks = [
    { href: "/deals", label: "Deals" },
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/top-rated", label: "Top Rated" },
  ];

  const accountLinks = [
    { href: "/account", label: "My Account" },
    { href: "/orders", label: "My Orders" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/settings", label: "Settings" },
  ];

  const getCategoryFeaturedProducts = (categoryId: string) => {
    const subIds = subCategories
      .filter((s) => s.parentId === categoryId)
      .map((s) => s.id);
    return featuredProducts.filter(
      (p) => p.categoryId === categoryId || subIds.includes(p.categoryId)
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
        <SheetHeader className="flex items-center justify-between border-b py-2">
          <SheetTitle className="text-sm">Zami Tech Solutions</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-4rem)] px-3 py-2 space-y-4">
          <div className="space-y-2">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="flex justify-between py-2 text-xs"
                  onClick={() => setOpen(false)}>
                  Home
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
              {specialLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex justify-between py-2 text-xs"
                    onClick={() => setOpen(false)}>
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Categories
            </h3>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={activeCategoryId ?? undefined}
              onValueChange={(val) => setActiveCategoryId(val ?? null)}>
              {mainCategories
                .filter((category) => category.parentId === null)
                .map((cat) => (
                  <AccordionItem key={cat.id} value={cat.id}>
                    <AccordionTrigger className="py-2 text-xs">
                      {cat.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">
                          Featured Products
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {getCategoryFeaturedProducts(cat.id).map((p) => (
                            <Link
                              key={p.id}
                              href={`/${p.slug}`}
                              className="block"
                              onClick={() => setOpen(false)}>
                              <div className="relative aspect-square rounded-md overflow-hidden mb-1">
                                <Image
                                  src={p.mainImage || "/placeholder.svg"}
                                  alt={p.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <p className="text-xs font-medium truncate">
                                {p.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(p.price)}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>

          <ul className="space-y-2">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex justify-between py-2 text-xs"
                  onClick={() => setOpen(false)}>
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
