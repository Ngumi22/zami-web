"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";

type CategoryTabsProps = {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  isPending: boolean;
};

export default function CategoryBar({
  categories,
  activeCategory,
  onCategoryChange,
  isPending,
}: CategoryTabsProps) {
  return (
    <section className="mx-auto">
      <div className="flex gap-2">
        {categories.map((cat) => (
          <Button
            variant="outline"
            key={cat.slug}
            onClick={() => onCategoryChange(cat.slug)}
            disabled={isPending}
            className={cn(
              "px-2 text-sm transition-all duration-200 rounded-none",
              activeCategory === cat.slug ? "bg-black text-white" : ""
            )}>
            {cat.name}
          </Button>
        ))}
      </div>
    </section>
  );
}
