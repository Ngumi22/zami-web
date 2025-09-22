"use client";

import Link from "next/link";
import Image from "next/image";
import { Brand, Category, Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface MegaMenuDropdownProps {
  category: Category;
  subcategories: Category[];
  featuredProducts: Product[];
  popularBrands: Brand[];
  onClose: () => void;
}

export function MegaMenuDropdown({
  category,
  subcategories,
  featuredProducts,
  popularBrands,
  onClose,
}: MegaMenuDropdownProps) {
  return (
    <div className="absolute left-0 top-full w-full bg-background border-b shadow-lg z-40">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-12 gap-4 lg:gap-8">
          <div className="col-span-12 md:col-span-3 md:border-r md:pr-4 lg:pr-8">
            <h3 className="font-medium text-lg mb-4">
              {category.name} Categories
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              {subcategories.map((subcategory) => (
                <li key={subcategory.id}>
                  <Link
                    href={`/products?category=${category.slug}&subcategories=${subcategory.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                    onClick={onClose}>
                    {subcategory.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4 mt-2 border-t">
                <Link
                  href={`/products?category=${category.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={onClose}>
                  View All {category.name}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-6 mt-6 md:mt-0">
            <h3 className="font-medium text-lg mb-4">Featured Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/${product.slug}`}
                  className="group block"
                  onClick={onClose}>
                  <div className="relative aspect-square rounded-md overflow-hidden mb-2">
                    <Image
                      src={product.mainImage || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 200px"
                    />
                  </div>
                  <h4 className="text-sm font-medium truncate">
                    {product.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 mt-6 md:mt-0">
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="relative p-6">
                  <h3 className="font-medium mb-2">Special Offer</h3>
                  <p className="text-sm mb-4">
                    Save up to 40% on {category.name}
                  </p>
                  <Link
                    href={`/products?category=${category.slug}&sale=true`}
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={onClose}>
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-normal text-lg mb-4 text-black">
                Popular Brands
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {popularBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/products?brand=${brand.slug}`}
                    className="flex items-center p-1 bg-black border rounded-md hover:border-primary transition-colors"
                    onClick={onClose}>
                    <div className="w-6 h-6 bg-muted flex items-center justify-center mr-2">
                      <Image
                        src={brand.logo || "/placeholder.jpg"}
                        height={50}
                        width={50}
                        alt={brand.slug}
                        className="h-full w-auto"
                      />
                    </div>
                    <span className="text-sm font-medium">{brand.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
