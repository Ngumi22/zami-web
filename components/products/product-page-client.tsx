"use client";

import { ProductDetails } from "@/components/products/product-details";
import RelatedProducts from "@/components/products/related-products";
import { FrequentlyBoughtTogether } from "@/components/products/frequently-bought-together";
import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useSingleProductData } from "@/lib/hooks";
import { Product } from "@prisma/client";

export default function ProductPageClient({
  slug,
  initialProduct,
  initialRelated,
  initialSuggested,
}: {
  slug: string;
  initialProduct: Product | null;
  initialRelated: Product[];
  initialSuggested: Product[];
}) {
  const {
    product,
    related,
    suggested,
    queries: { productQuery },
  } = useSingleProductData({
    slug,
    productId: initialProduct?.id,
    initialProduct,
    initialRelated,
    initialSuggested,
  });

  const { isLoading, isError } = productQuery;

  useEffect(() => {
    if (isError || (!isLoading && !product)) {
      notFound();
    }
  }, [isError, isLoading, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 order-2 lg:order-1">
                <div className="p-4 lg:p-6 h-full animate-pulse bg-gray-100" />
              </div>
              <div className="lg:w-3/4 order-1 lg:order-2">
                <div className="p-4 lg:p-6 animate-pulse bg-gray-100" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 order-2 lg:order-1">
              <div className="p-4 lg:p-6 h-full">
                <RelatedProducts products={related || []} />
              </div>
            </div>

            <div className="lg:w-3/4 order-1 lg:order-2">
              <div className="p-4 lg:p-6">
                <ProductDetails product={product} />
              </div>
            </div>
          </div>
        </div>

        {(suggested?.length ?? 0) > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 lg:p-6">
              <FrequentlyBoughtTogether
                mainProduct={product}
                suggestedProducts={suggested ?? []}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
