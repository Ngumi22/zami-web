"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { XCircle, CheckCircle, Star } from "lucide-react";

export function renderSpecValue(value: any, specName: string): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground text-xs sm:text-sm">-</span>;
  }

  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" />
    ) : (
      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" />
    );
  }

  if (specName === "category") {
    return (
      <Badge variant="secondary" className="text-xs">
        {String(value)}
      </Badge>
    );
  }

  if (specName === "rating") {
    const rating = Number(value);
    if (isNaN(rating)) {
      return (
        <span className="text-muted-foreground text-xs sm:text-sm">-</span>
      );
    }
    return (
      <div className="flex items-center justify-center gap-1">
        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-xs sm:text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <span className="text-xs sm:text-sm break-words">{value.join(", ")}</span>
    );
  }

  return (
    <span className="text-xs sm:text-sm break-words">{String(value)}</span>
  );
}
