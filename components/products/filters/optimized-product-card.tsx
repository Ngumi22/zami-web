"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductWithDetails } from "@/data/product-page-product";

interface OptimizedProductCardProps {
  product: ProductWithDetails;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

// Generate blur placeholder for better loading experience
const generateBlurDataURL = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1f2937"; // gray-800
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
};

// Create a simple blur placeholder as base64
const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

export const OptimizedProductCard = memo(function OptimizedProductCard({
  product,
  priority = false,
  loading = "lazy",
}: OptimizedProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="relative aspect-square bg-gray-800">
        {/* Image Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Optimized Image */}
        <Image
          src={
            imageError
              ? "/placeholder.svg?height=300&width=300&text=No+Image"
              : product.image ||
                "/placeholder.svg?height=300&width=300&text=Product"
          }
          alt={product.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          onError={handleImageError}
          onLoad={handleImageLoad}
          quality={85}
        />

        {/* Quick View Button (appears on hover) */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm text-white opacity-0 hover:opacity-100 transition-opacity duration-300 group-hover:opacity-100">
          Quick View
        </Button>
      </div>

      <div className="p-4">
        <h3 className="text-white font-medium mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-300">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">
            ${product.price.toLocaleString()}
          </span>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
});
