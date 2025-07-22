"use client";

import { useRouter } from "next/navigation";
import { CategoryHierarchy } from "./category-hierarchy";
import { Category } from "@prisma/client";
import { deleteCategory } from "@/lib/category-actions";

interface CategoryHierarchyWrapperProps {
  categories: Category[];
  level?: number;
  maxLevel?: number;
}

export function CategoryHierarchyWrapper({
  categories,
  level = 0,
  maxLevel = 5,
}: CategoryHierarchyWrapperProps) {
  const router = useRouter();

  const handleCategoryClick = (category: Category) => {
    router.push(`/admin/categories/${category.slug}`);
  };

  const handleEditCategory = (category: Category) => {
    router.push(`/admin/categories/${category.slug}/edit`);
  };

  const handleDeleteCategory = async (category: Category) => {
    await deleteCategory(category.id);
  };

  return (
    <CategoryHierarchy
      categories={categories}
      onCategoryClick={handleCategoryClick}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      level={level}
      maxLevel={maxLevel}
    />
  );
}
