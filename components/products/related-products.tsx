"use client";

import { Product } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type RelatedProductsProps = {
  products: Product[];
};

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <div className="space-y-4 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white pb-2">
        Related Products
      </h3>

      {/* Mobile: Horizontal scroll */}
      <div className="lg:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${product.slug}`}
              className="flex-shrink-0 w-40 group">
              <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-gray-100 transition-colors">
                <div className="aspect-square bg-white rounded-md mb-2 overflow-hidden">
                  <Image
                    src={
                      product.mainImage ||
                      "/placeholder.svg?height=120&width=120"
                    }
                    alt={product.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">
                    {product.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden lg:block space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/${product.slug}`}
            className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={product.mainImage || "/placeholder.svg?height=64&width=64"}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600">
                {product.name}
              </h4>
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-xs text-gray-500">
                  ({product.reviewCount || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
