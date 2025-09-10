"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ProductCarouselProps {
  title?: React.ReactNode;
  viewAllHref?: string;
  children: React.ReactNode;
}

export function ProductCarousel({
  title,
  viewAllHref,
  children,
}: ProductCarouselProps) {
  return (
    <div className="py-4">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="md:text-xl font-semibold">{title}</h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="flex gap-1 items-centre text-sm font-normal hover:underline">
              View all <ArrowRight className="my-auto h-4 w-4" />
            </a>
          )}
        </div>
      )}

      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ProductCarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}
