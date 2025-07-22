"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Category } from "@prisma/client";

interface MobileFiltersProps {
  categories: Category[];
}

export function MobileFilters({ categories }: MobileFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Get current filter values from URL
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "featured";
  const currentPriceRange = searchParams.get("price") || "";
  const currentInStock = searchParams.get("inStock") === "true";

  // Local state for filter values
  const [category, setCategory] = useState(currentCategory);
  const [sort, setSort] = useState(currentSort);
  const [priceRange, setPriceRange] = useState(currentPriceRange);
  const [inStock, setInStock] = useState(currentInStock);

  const priceRanges = [
    { value: "under-100", label: "Under Ksh 100" },
    { value: "100-500", label: "Ksh 100 - Ksh 500" },
    { value: "500-1000", label: "Ksh 500 - Ksh 1000" },
    { value: "over-1000", label: "Over Ksh 1000" },
  ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "best-selling", label: "Best Selling" },
  ];

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (priceRange) params.set("price", priceRange);
    if (inStock) params.set("inStock", "true");

    router.push(`/products?${params.toString()}`);
    setOpen(false);
  };

  const resetFilters = () => {
    setCategory("");
    setSort("featured");
    setPriceRange("");
    setInStock(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-y-auto w-full p-0">
        <SheetHeader className="border-b h-16 px-4 flex flex-row items-center justify-between">
          <SheetTitle className="text-left">Filters</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-13rem)] p-4">
          <div className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <h3 className="font-medium">Categories</h3>
              <RadioGroup value={category} onValueChange={setCategory}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="category-all" />
                    <Label htmlFor="category-all">All Categories</Label>
                  </div>
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={cat.id}
                        id={`category-${cat.id}`}
                      />
                      <Label htmlFor={`category-${cat.id}`}>{cat.name}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Sort */}
            <div className="space-y-3">
              <h3 className="font-medium">Sort By</h3>
              <RadioGroup value={sort} onValueChange={setSort}>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`sort-${option.value}`}
                      />
                      <Label htmlFor={`sort-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-3">
              <h3 className="font-medium">Price Range</h3>
              <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="price-all" />
                    <Label htmlFor="price-all">All Prices</Label>
                  </div>
                  {priceRanges.map((range) => (
                    <div
                      key={range.value}
                      className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={range.value}
                        id={`price-${range.value}`}
                      />
                      <Label htmlFor={`price-${range.value}`}>
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-3">
              <h3 className="font-medium">Availability</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(!!checked)}
                />
                <Label htmlFor="in-stock">In Stock Only</Label>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t p-4 flex flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            Reset
          </Button>
          <Button className="flex-1" onClick={applyFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
