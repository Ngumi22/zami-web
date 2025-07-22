"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
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
import { Category } from "@prisma/client";

interface MobileMenuProps {
  categories: Category[];
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Skip rendering on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Special links
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-8 w-8" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
        <SheetHeader className="border-b h-16 px-4 flex flex-row items-center justify-between">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="px-6 py-4">
            <nav className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Shop
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/"
                      className="flex items-center justify-between py-2 text-base font-medium"
                      onClick={() => setOpen(false)}>
                      Home
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                  {specialLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between py-2 text-base font-medium"
                        onClick={() => setOpen(false)}>
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Categories
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {categories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="py-2 text-base font-medium">
                        {category.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 space-y-2">
                          <Link
                            href={`/products?category=${category.id}`}
                            className="block py-2"
                            onClick={() => setOpen(false)}>
                            All {category.name}
                          </Link>
                          {getMockSubcategories(category.id).map(
                            (subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/products?category=${category.id}&subcategory=${subcategory.id}`}
                                className="block py-2 text-sm"
                                onClick={() => setOpen(false)}>
                                {subcategory.name}
                              </Link>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Featured products in mobile menu */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Featured Products
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {getFeaturedProducts().map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block"
                      onClick={() => setOpen(false)}>
                      <div className="relative aspect-square rounded-md overflow-hidden mb-1">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          height={300}
                          width={300}
                          className="object-contain h-auto w-auto"
                          sizes="150px"
                        />
                      </div>
                      <h4 className="text-xs font-medium truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Account
                </h3>
                <ul className="space-y-3">
                  {accountLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between py-2 text-base font-medium"
                        onClick={() => setOpen(false)}>
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper functions to generate mock data
function getMockSubcategories(categoryId: string) {
  const baseName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  return [
    { id: `${categoryId}-sub-1`, name: `${baseName} Type 1` },
    { id: `${categoryId}-sub-2`, name: `${baseName} Type 2` },
    { id: `${categoryId}-sub-3`, name: `${baseName} Type 3` },
    { id: `${categoryId}-sub-4`, name: `${baseName} Type 4` },
  ];
}

function getFeaturedProducts() {
  return [
    {
      id: "featured-1",
      name: "Latest Smartphone",
      image: "/placeholder.svg",
      price: 799,
    },
    {
      id: "featured-2",
      name: "Wireless Headphones",
      image: "/placeholder.svg",
      price: 199,
    },
  ];
}
