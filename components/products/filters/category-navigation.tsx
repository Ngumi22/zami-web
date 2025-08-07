import { memo } from "react";
import Link from "next/link";
import { OutputCategory } from "@/data/cat";

interface CategoryNavigationProps {
  currentCategory: string;
  categories: OutputCategory[];
}

export const CategoryNavigation = memo(function CategoryNavigation({
  currentCategory,
  categories,
}: CategoryNavigationProps) {
  if (!categories) {
    return null;
  }
  return (
    <div className="flex gap-6 mb-3 overflow-x-auto">
      {categories
        .filter((cat) => cat.parentId === null)
        .map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`text-xs whitespace-nowrap pb-2 border-b-2 transition-colors scrollbar-hide ${
              currentCategory === category.slug
                ? "border-blue-500 "
                : "border-transparent"
            }`}>
            {category.name}
          </Link>
        ))}
    </div>
  );
});
