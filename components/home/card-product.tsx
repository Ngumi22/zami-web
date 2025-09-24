"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { CompareIcon, Eye, WishlistIcon } from "../layout/Static/icons";
import Image from "next/image";
import { AddToCartButton } from "../admin/product-sections/add-to-cart";
import { ProductCardData } from "@/data/fetch-all";

type ProductCardProps = {
  product: ProductCardData;
};

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  const discountPercentage =
    product.originalPrice &&
    Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );

  return (
    <div className="group block my-4">
      <div className="relative h-[200px] sm:h-[250px] bg-gray-100">
        <Image
          src={product.mainImage}
          alt={product.slug}
          fill
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-100 group-hover:opacity-90 m-auto overflow-hidden transition delay-150 duration-300 ease-in-out hover:scale-105"
        />
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-gray-400 text-white text-pretty text-xs font-semibold px-2 py-0.5">
              -{discountPercentage}%
            </span>
          )}
          {product.collection == null ? null : (
            <span className="bg-black text-white text-pretty text-xs font-semibold px-2 py-0.5">
              {product.collection}
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2">
          <p className="flex items-center gap-1 text-xs font-normal">
            <span
              className={`
                    inline-block w-2 h-2 rounded-full animate-pulse
                    ${product.stock > 1 ? "bg-green-500" : "bg-red-500"}
                `}
            />
            <span
              className={product.stock > 1 ? "text-green-600" : "text-red-600"}>
              {product.stock > 1 ? "Available" : "Out of Stock"}
            </span>
          </p>
        </div>

        <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-4 w-auto flex-col items-center justify-center">
          <button className="group/item flex items-center">
            <span className="group/edit invisible absolute right-full mr-6 whitespace-nowrap rounded-sm bg-black px-2 py-1 text-white opacity-0 transition-all duration-300 ease-in-out -translate-x-4 group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0">
              Add To Wishlist
            </span>
            <span className="bg-white hover:bg-black hover:text-white rounded-sm p-2 transition ease-in-out delay-100 group-hover:-translate-x-3 hover:scale-110 duration-300">
              <WishlistIcon className="size-4 stroke-[2px]" />
            </span>
          </button>
          <button className="group/item flex items-center">
            <span className="group/edit invisible absolute right-full mr-6 whitespace-nowrap rounded-sm bg-black px-2 py-1 text-white opacity-0 transition-all duration-300 ease-in-out -translate-x-4 group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0">
              Add To Compare
            </span>
            <span className="bg-white hover:bg-black hover:text-white rounded-sm p-2 transition ease-in-out delay-200 group-hover:-translate-x-3 hover:scale-110 duration-300">
              <CompareIcon className="size-4 stroke-[2px]" />
            </span>
          </button>
          <button className="group/item flex items-center">
            <span className="group/edit invisible absolute right-full mr-6 whitespace-nowrap rounded-sm bg-black px-2 py-1 text-white opacity-0 transition-all duration-300 ease-in-out -translate-x-4 group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0">
              Quick View
            </span>
            <span className="bg-white hover:bg-black hover:text-white rounded-sm p-2 transition ease-in-out delay-300 group-hover:-translate-x-3 hover:scale-110 duration-300">
              <Eye className="size-4 stroke-[2px]" />
            </span>
          </button>
        </div>
      </div>

      <div className="mt-1 flex flex-col space-y-1 justify-between font-medium">
        <Link
          href={`/products/${product.slug}`}
          className="text-gray-900 group-hover:opacity-85 text-sm font-medium">
          {product.name}
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href={`/products?categories=${product.category.slug}`}
            className="text-gray-600 font-semibold text-xs">
            {product.category.name},
          </Link>
          <Link
            href={`/products?category=${product.category.slug}&brands=${product.brand}`}
            className="text-gray-600 font-semibold text-xs">
            {product.brand}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-gray-900">{formatCurrency(product.price)}</p>
            {product.originalPrice && (
              <p className="text-gray-400 line-through text-xs">
                {formatCurrency(product.originalPrice)}
              </p>
            )}
          </div>

          <div>
            <AddToCartButton product={product} mode="icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
