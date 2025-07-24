"use client";

import { useState, useRef, useEffect } from "react";

type DebounceStrategy = "search" | "price" | "filter";

export function useOptimizedDebounce<T>(
  value: T,
  delay: number,
  strategy: DebounceStrategy = "filter"
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
