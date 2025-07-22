"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageZoomModal } from "./image-zoom-modal";

interface CompactImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  productName,
  className,
}: CompactImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <div className={cn("", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        {images.length > 1 && (
          <div className="flex sm:flex-col order-2 sm:order-1 gap-1 sm:gap-0 overflow-x-auto sm:overflow-visible sm:h-64 sm:w-16 sm:justify-between">
            {images.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative flex-shrink-0 w-12 h-12 sm:h-auto sm:flex-1 rounded-md overflow-hidden border transition-all hover:scale-105",
                  selectedImage === index
                    ? "border-primary ring-1 ring-primary/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                )}>
                <Image
                  src={image || "/placeholder.svg?height=48&width=48"}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-0.5"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative group flex-1 order-1 sm:order-2">
          <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border">
            <div className="aspect-square relative w-full h-64">
              <Image
                src={
                  images[selectedImage] ||
                  "/placeholder.svg?height=350&width=350"
                }
                alt={`${productName} - Image ${selectedImage + 1}`}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                sizes="350px"
              />
            </div>

            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute top-2 right-2 h-7 w-7 bg-white/90 hover:bg-white shadow-sm",
                "opacity-0 group-hover:opacity-100 transition-all duration-200",
                "backdrop-blur-sm border border-white/20"
              )}
              onClick={() => setIsZoomOpen(true)}>
              <ZoomIn className="h-3 w-3" />
            </Button>

            {images.length > 1 && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm border border-white/20"
                  onClick={() =>
                    setSelectedImage(
                      (prev) => (prev - 1 + images.length) % images.length
                    )
                  }>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm border border-white/20"
                  onClick={() =>
                    setSelectedImage((prev) => (prev + 1) % images.length)
                  }>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageZoomModal
        src={images[selectedImage] || "/placeholder.svg"}
        alt={`${productName} - Zoomed view`}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
}
