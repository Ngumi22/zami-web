"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface InstantSearchProps {
  products: Product[];
}

export function InstantSearch({ products }: InstantSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const performSearch = () => {
      setIsLoading(true);
      try {
        const filtered = products.filter(
          (product) =>
            product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(debouncedQuery.toLowerCase()) ||
            product.categoryId
              ?.toLowerCase()
              .includes(debouncedQuery.toLowerCase())
        );
        setResults(filtered.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, products]);

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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
          type="search"
          placeholder="Search products..."
          className="pl-9 w-full focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 rounded-sm"
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
        <div className="fixed inset-0 bg-background md:absolute md:inset-auto md:top-full md:mt-2 md:border md:bg-background md:shadow-lg z-50">
          <div className="flex items-center p-4 md:hidden">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 max-h-[80vh] md:max-h-[300px] overflow-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center p-2 hover:bg-muted rounded-md transition-colors">
                    <div className="relative h-12 w-12 rounded overflow-hidden mr-3">
                      <Image
                        src={product.mainImage || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
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
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="block w-full text-center text-sm text-primary hover:underline mt-2 pt-2 border-t">
                    View all results for "{query}"
                  </Link>
                )}
              </div>
            ) : query ? (
              <p className="text-center py-8 text-muted-foreground">
                No products found for "{query}"
              </p>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Start typing to search products
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
