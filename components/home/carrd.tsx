"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  BagIcon,
  CompareIcon,
  Eye,
  Star,
  WishlistIcon,
} from "../layout/Static/icons";
import Image from "next/image";
import { Product } from "@prisma/client";

type ProductCardProps = {
  product: Product & {
    category: string;
    brand: string;
    variant: string[];
    collection: string;
  };
};

export default function ElectronicsCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  const discountPercentage =
    product.originalPrice && (product.originalPrice / product.price) * 100;

  return (
    <div className="group block my-4">
      <div className="relative h-[200px] sm:h-[250px]">
        <div>
          <Image
            src={product.name}
            alt={product.slug}
            fill
            loading="lazy"
            className="absolute inset-0 h-[200px] sm:h-[250px] w-full object-cover opacity-100 group-hover:opacity-90 m-auto overflow-hidden"
          />
        </div>
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {hasDiscount ? (
            ""
          ) : (
            <span className="bg-gray-400 text-white text-pretty text-xs font-semibold px-2 py-0.5">
              {discountPercentage}
            </span>
          )}
          <span className="bg-black text-white text-pretty text-xs font-semibold px-2 py-0.5">
            {product.collection}
          </span>
        </div>

        <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-4 w-auto flex-col items-center justify-center">
          <button className="group/item flex items-center">
            <span
              className="group/edit invisible absolute right-full mr-6 whitespace-nowrap rounded-sm bg-black px-2 py-1 text-white
                 opacity-0 transition-all duration-300 ease-in-out
                 -translate-x-4 group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0">
              Add To Wishlist
            </span>
            <span className="bg-white hover:bg-black hover:text-white rounded-sm p-2 transition ease-in-out delay-100 group-hover:-translate-x-3 hover:scale-110 duration-300">
              <WishlistIcon className="size-4 stroke-[2px]" />
            </span>
          </button>
          <button className="group/item flex items-center">
            <span
              className="group/edit invisible absolute right-full mr-6 whitespace-nowrap rounded-sm bg-black px-2 py-1 text-white
                 opacity-0 transition-all duration-300 ease-in-out
                 -translate-x-4 group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0">
              Add To Compare
            </span>
            <span className="bg-white hover:bg-black hover:text-white rounded-sm p-2 transition ease-in-out delay-200 group-hover:-translate-x-3 hover:scale-110 duration-300">
              <CompareIcon className="size-4 stroke-[2px]" />
            </span>
          </button>
          <button className="group/item flex items-center">
            <span
              className="group/edit invisible absolute right-full mr-6 whitespace-nowrap rounded-sm bg-black px-2 py-1 text-white
                 opacity-0 transition-all duration-300 ease-in-out
                 -translate-x-4 group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0">
              Quick View
            </span>
            <span className="bg-white hover:bg-black hover:text-white rounded-sm p-2 transition ease-in-out delay-300 group-hover:-translate-x-3 hover:scale-110 duration-300">
              <Eye className="size-4 stroke-[2px]" />
            </span>
          </button>
        </div>
        <button className="absolute bottom-1 opacity-0 group-hover:opacity-100 w-auto inset-x-4 px-4 bg-black p-2 rounded-sm text-white font-medium transition ease-in-out delay-150 group-hover:-translate-y-1 hover:scale-110 duration-300">
          <span className="flex gap-2 items-center justify-center mx-auto hover:text-gray-300">
            Add To Cart <BagIcon className="size-3 my-auto" />
          </span>
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <ul className="flex gap-1">
            <li>
              <Star className="size-2.5 fill-black" />
            </li>
            <li>
              <Star className="size-2.5 fill-black" />
            </li>
            <li>
              <Star className="size-2.5 fill-black" />
            </li>
            <li>
              <Star className="size-2.5 fill-black" />
            </li>
            <li>
              <Star className="size-2.5 fill-black" />
            </li>
          </ul>
          <div className="flex flex-wrap justify-center gap-2 [&:hover_label]:opacity-75">
            <div>
              <input type="checkbox" id="ColorP" className="sr-only" />

              <label
                htmlFor="ColorP"
                className="block size-3 ring-1 ring-offset-2 ring-black cursor-pointer rounded-full bg-[#d89f97] transition hover:!opacity-100">
                <span className="sr-only"> Pink </span>
              </label>
            </div>

            <div>
              <input type="checkbox" id="ColorG" className="sr-only" />

              <label
                htmlFor="ColorG"
                className="block size-3 cursor-pointer rounded-full bg-[#afbfab] transition hover:!opacity-100">
                <span className="sr-only"> Pink </span>
              </label>
            </div>

            <div>
              <input type="checkbox" id="ColorSb" className="sr-only" />

              <label
                htmlFor="ColorSb"
                className="block size-3 cursor-pointer rounded-full bg-[#91a5bb] transition hover:!opacity-100">
                <span className="sr-only"> Pink </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1 justify-between font-medium">
          <Link
            href={`/products/small-headphones`}
            className="text-gray-900 group-hover:opacity-85 text-sm font-medium">
            {product.name}
          </Link>
          <div className="flex items-center justify-between pr-2">
            <Link
              href={`/products?categories=smartphones`}
              className="text-gray-900 group-hover:opacity-85 text-xs">
              {product.category}
            </Link>
            <div className="flex flex-wrap justify-center gap-1 [&:hover_label]:opacity-75">
              <div>
                <label
                  htmlFor=""
                  className="p-1 md:size-7 flex items-center cursor-pointer rounded-full bg-gray-100 transition hover:!opacity-100">
                  <span className="text-xs m-auto">64</span>
                </label>
              </div>

              <div>
                <label
                  htmlFor=""
                  className="p-1 md:size-7 flex items-center cursor-pointer rounded-full bg-gray-100 transition hover:!opacity-100">
                  <span className="text-xs m-auto">128</span>
                </label>
              </div>

              <div>
                <label
                  htmlFor=""
                  className="p-1 md:size-7 flex items-center cursor-pointer rounded-full bg-gray-100 transition hover:!opacity-100">
                  <span className="text-xs m-auto">256</span>
                </label>
              </div>
              <div>
                <label
                  htmlFor=""
                  className="p-1 md:size-7 flex items-center cursor-pointer rounded-full bg-gray-100 transition hover:!opacity-100">
                  <span className="text-xs m-auto">512</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <p className="text-gray-900">{formatCurrency(product.price)}</p>
            <p className="text-gray-400 line-through text-xs">
              {product.originalPrice !== null &&
              product.originalPrice !== undefined
                ? formatCurrency(product.originalPrice)
                : null}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
