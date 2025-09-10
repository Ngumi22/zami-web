"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import debounce from "lodash.debounce";
import type { Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface InstantSearchProps {
  products: Product[];
}

// Precompute searchable text for each product to avoid repeated processing
const preprocessProducts = (products: Product[]) => {
  return products.map((product) => ({
    ...product,
    searchText: `${product.name} ${product.description || ""} ${
      product.categoryId || ""
    }`.toLowerCase(),
  }));
};

// Memoized search function for better performance
const searchProducts = (products: PreprocessedProduct[], query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products
    .filter((product) => product.searchText.includes(lowercaseQuery))
    .slice(0, 5);
};

type PreprocessedProduct = Product & { searchText: string };

export function InstantSearch({ products }: InstantSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preprocess products once on component mount
  const preprocessedProducts = useMemo(
    () => preprocessProducts(products),
    [products]
  );

  // Create debounced search function
  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      if (!searchQuery) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const filtered = searchProducts(preprocessedProducts, searchQuery);
        setResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle query changes with debounce
  useEffect(() => {
    setIsLoading(!!query);
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear search results when closing
  const handleCloseSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  // Handle product selection
  const handleProductSelect = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  return (
    <div className="relative flex-1 w-full" ref={searchRef}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Search">
        <Search className="h-5 w-5" />
      </Button>

      <div className="relative hidden md:flex w-full max-w-sm items-center">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="text-xs pl-9 w-full focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 rounded-sm bg-gray-50"
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          ref={inputRef}
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-background md:absolute md:inset-auto md:top-full md:mt-2 md:border md:bg-background md:shadow-lg z-50 text-xs">
          <div className="flex items-center p-4 md:hidden">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={handleCloseSearch}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-sm p-4 max-h-[80vh] md:max-h-[300px] overflow-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleProductSelect}
                    className="flex items-center p-2 hover:bg-muted rounded-md transition-colors text-xs">
                    <div className="relative h-12 w-12 rounded overflow-hidden mr-3 flex-shrink-0">
                      <Image
                        src={product.mainImage || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}

                {query && (
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={handleProductSelect}
                    className="text-xs block w-full text-center text-black hover:underline mt-2 pt-2 border-t">
                    View all results for "{query}"
                  </Link>
                )}
              </div>
            ) : query ? (
              <p className="text-xs text-center py-8 text-muted-foreground">
                No products found for "{query}"
              </p>
            ) : (
              <p className="text-xs text-center py-4 text-muted-foreground">
                Start typing to search products
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
