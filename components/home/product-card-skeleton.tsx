"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background">
      <div className="relative aspect-square overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
