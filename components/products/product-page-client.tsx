"use client";

import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/product-details";
import { FrequentlyBoughtTogether } from "@/components/products/frequently-bought-together";
import RelatedProducts from "@/components/products/related-products";
import { useProductBySlug } from "@/lib/hooks";
import { useQueries } from "@tanstack/react-query";
import {
  getFrequentlyBoughtTogetherProducts,
  getRelatedProducts,
} from "@/data/product";
import { useEffect } from "react";

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const { data: product, isLoading, isError } = useProductBySlug(slug);

  const [{ data: relatedProducts }, { data: suggestedProducts }] = useQueries({
    queries: [
      {
        queryKey: ["related-products", product?.id],
        queryFn: () => (product ? getRelatedProducts(product.id) : []),
        enabled: !!product,
      },
      {
        queryKey: ["frequently-bought", product?.id],
        queryFn: () =>
          product ? getFrequentlyBoughtTogetherProducts(product.id) : [],
        enabled: !!product,
      },
    ],
  });

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
              {/* Loading skeletons */}
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
                <RelatedProducts products={relatedProducts || []} />
              </div>
            </div>

            <div className="lg:w-3/4 order-1 lg:order-2">
              <div className="p-4 lg:p-6">
                <ProductDetails product={product} />
              </div>
            </div>
          </div>
        </div>

        {(suggestedProducts?.length ?? 0) > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 lg:p-6">
              <FrequentlyBoughtTogether
                mainProduct={product}
                suggestedProducts={suggestedProducts || []}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
