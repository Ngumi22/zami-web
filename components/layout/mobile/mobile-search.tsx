"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDebounce } from "@/hooks/use-debounce";
import type { Category, Product } from "@prisma/client";

interface MobileSearchProps {
  categories: Category[];
  products: Product[];
}

export function MobileSearch({ categories, products }: MobileSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Handle search
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const performSearch = () => {
      setIsLoading(true);
      try {
        const filtered = products.filter((product) => {
          const lowerQuery = debouncedQuery.toLowerCase();
          const matchesProduct =
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery);

          const matchesCategory = categories.some(
            (c) =>
              c.id === product.categoryId &&
              c.name.toLowerCase().includes(lowerQuery)
          );

          return matchesProduct || matchesCategory;
        });

        setResults(filtered.slice(0, 5)); // Limit to 5 results
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, products, categories]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSearch = (searchTerm: string) => {
    saveSearch(searchTerm);
    setOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="flex flex-col items-center justify-center w-full h-full text-xs text-muted-foreground cursor-pointer">
          <Search className="h-5 w-5 mb-1" />
          <span>Search</span>
        </div>
      </SheetTrigger>
      <SheetContent side="top" className="h-[60vh] w-full p-0 search-dropdown">
        <SheetHeader className="border-b h-16 px-4 flex flex-row items-center justify-between">
          <SheetTitle>Search</SheetTitle>
          <div className="flex items-center justify-between w-full">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search products..."
                className="mx-auto w-80 pr-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setQuery("")}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-8rem)] p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">
                Search Results
              </h3>
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => handleSearch(query)}
                    className="flex items-center p-3 hover:bg-muted rounded-md transition-colors">
                    <div className="relative h-16 w-16 rounded overflow-hidden mr-3">
                      <Image
                        src={product.mainImage || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => handleSearch(query)}
                className="block w-full text-center text-sm text-primary hover:underline mt-2 pt-2 border-t">
                View all results for "{query}"
              </Link>
            </div>
          ) : query ? (
            <p className="text-center py-8 text-muted-foreground">
              No products found for "{query}"
            </p>
          ) : (
            <div className="space-y-6">
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Recent Searches
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}>
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        className="flex items-center w-full p-3 hover:bg-muted rounded-md transition-colors text-left"
                        onClick={() => {
                          setQuery(term);
                        }}>
                        <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      className="flex items-center w-full p-3 hover:bg-muted rounded-md transition-colors text-left"
                      onClick={() => {
                        setQuery(term);
                      }}>
                      <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
