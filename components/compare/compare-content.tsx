"use client";

import Image from "next/image";
import React, { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Info,
  Plus,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCompareStore } from "@/hooks/use-compare";
import {
  categorizeSpecifications,
  formatCurrency,
  getAllSpecificationNames,
  getSpecificationValueByName,
} from "@/lib/utils";
import { renderSpecValue } from "./render-spec-value";
import { MobileProductCard } from "./mobile-product-card";
import { AddToCartButton } from "../admin/product-sections/add-to-cart-button";

export function CompareContent() {
  const { items, clearAll, removeItem } = useCompareStore();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  if (!items) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 md:px-6 lg:px-8">
        <div className="text-center py-8 sm:py-16">
          <div className="animate-pulse">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-32 sm:w-48 mx-auto mb-2"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-48 sm:w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 sm:py-16 px-4">
        <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg sm:text-xl mb-2">No products to compare</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Add products to compare their features and specifications
        </p>
        <Button asChild variant="outline">
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    );
  }

  const allSpecNames = getAllSpecificationNames(items);
  const categorizedSpecs = categorizeSpecifications(allSpecNames);

  const defaultVariantsMap = new Map<
    string,
    { value: string; priceModifier: number }
  >();

  const MobileView = () => (
    <div className="block lg:hidden">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
            Compare Products
          </div>
          <Button
            variant="outline"
            onClick={clearAll}
            size="sm"
            className="flex items-center gap-1 text-xs bg-transparent">
            <RotateCcw className="w-3 h-3" />
            Clear All
          </Button>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-1 text-sm bg-transparent"
          asChild>
          <a href="/products">
            <Plus className="w-4 h-4" />
            Add Product
          </a>
        </Button>
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCurrentProductIndex(Math.max(0, currentProductIndex - 1))
            }
            disabled={currentProductIndex === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentProductIndex + 1} of {items.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCurrentProductIndex(
                Math.min(items.length - 1, currentProductIndex + 1)
              )
            }
            disabled={currentProductIndex === items.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <MobileProductCard
        product={items[currentProductIndex]}
        onRemove={() => removeItem(items[currentProductIndex].id)}
      />

      <Card className="mt-4">
        <CardContent className="p-0">
          {Object.entries(categorizedSpecs).map(([categoryName, specs]) => (
            <div
              key={categoryName}
              className="border-b border-gray-200 last:border-b-0">
              <div className="bg-gray-100 p-3 font-bold text-gray-800 text-sm capitalize">
                {categoryName}
              </div>
              {specs.map((specName) => {
                const value = getSpecificationValueByName(
                  items[currentProductIndex],
                  specName
                );
                return (
                  <div
                    key={specName}
                    className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700 text-sm">
                      {specName}
                    </span>
                    <div className="text-right">
                      {renderSpecValue(value, specName)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Desktop/Tablet view
  const DesktopView = () => (
    <div className="hidden lg:block">
      {/* Desktop Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 text-lg text-gray-800">
          Compare Products
          <Info className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="flex items-center gap-1 text-sm bg-transparent"
            asChild>
            <a href="/products">
              <Plus className="w-4 h-4" />
              Add Product
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={clearAll}
            className="flex items-center gap-1 text-sm bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <div className="min-w-max">
          <div
            className="grid gap-0 border border-gray-200 rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `minmax(180px, 200px) repeat(${items.length}, minmax(220px, 280px))`,
            }}>
            <div className="bg-gray-50 p-3 lg:p-4 border-r border-gray-200 text-sm lg:text-base">
              Product
            </div>

            {items.map((product) => (
              <div
                key={product.id}
                className="bg-white p-3 lg:p-4 border-r border-gray-200 last:border-r-0 text-center relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeItem(product.id)}>
                  <X className="h-3 w-3" />
                </Button>
                <Image
                  src={
                    product.mainImage ||
                    "/placeholder.svg?height=80&width=80&query=product"
                  }
                  alt={product.name}
                  width={80}
                  height={80}
                  className="mx-auto mb-3 object-contain rounded"
                />
                <h4 className="text-xs lg:text-sm mb-1 line-clamp-2">
                  {product.name}
                </h4>

                <p className="font-semibold">{formatCurrency(product.price)}</p>

                <AddToCartButton
                  product={product}
                  selectedVariants={Object.fromEntries(
                    Array.from(defaultVariantsMap.entries()).map(
                      ([type, { value }]) => [type, value]
                    )
                  )}
                  quantity={1}
                  className="flex-1 w-full h-8"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <Card>
            <CardContent className="p-0">
              <div
                className="grid gap-0"
                style={{
                  gridTemplateColumns: `minmax(180px, 200px) repeat(${items.length}, minmax(220px, 280px))`,
                }}>
                {Object.entries(categorizedSpecs).map(
                  ([categoryName, specs]) => (
                    <Fragment key={categoryName}>
                      <div className="bg-gray-100 p-2 lg:p-3 font-bold text-gray-800 border-b border-gray-200 col-span-full text-sm lg:text-base capitalize">
                        {categoryName}
                      </div>

                      {specs.map((specName) => (
                        <Fragment key={specName}>
                          <div className="bg-gray-50 p-2 lg:p-3 font-medium text-gray-700 text-xs lg:text-sm border-r border-b border-gray-200 capitalize">
                            {specName}
                          </div>

                          {items.map((product) => {
                            const value = getSpecificationValueByName(
                              product,
                              specName
                            );
                            return (
                              <div
                                key={`${product.id}-${specName}`}
                                className="p-2 lg:p-3 text-center border-r border-b border-gray-200 last:border-r-0">
                                {renderSpecValue(value, specName)}
                              </div>
                            );
                          })}
                        </Fragment>
                      ))}
                    </Fragment>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 py-2 sm:py-6 md:px-4 lg:px-6">
      <MobileView />
      <DesktopView />
    </div>
  );
}
