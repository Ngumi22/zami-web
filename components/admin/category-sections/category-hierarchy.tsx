"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

interface CategoryHierarchyProps {
  categories: CategoryWithChildren[];
  onCategoryClick?: (category: Category) => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  level?: number;
  maxLevel?: number;
}

export function CategoryHierarchy({
  categories,
  onCategoryClick,
  onEditCategory,
  onDeleteCategory,
  level = 0,
  maxLevel = 5,
}: CategoryHierarchyProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getIndentClass = (level: number) => {
    const indentMap = {
      0: "ml-0",
      1: "ml-4",
      2: "ml-8",
      3: "ml-12",
      4: "ml-16",
      5: "ml-20",
    };
    return indentMap[level as keyof typeof indentMap] || "ml-20";
  };

  const getBorderClass = (level: number) => {
    if (level === 0) return "";
    return "border-l-2 border-gray-200 pl-4";
  };

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const hasSubcategories =
          category.children && category.children.length > 0;
        const isExpanded = expandedCategories.has(category.id);

        return (
          <div
            key={category.id}
            className={`${getIndentClass(level)} ${getBorderClass(level)}`}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Expand/Collapse Button */}
                    {hasSubcategories ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(category.id)}
                        className="p-1 h-6 w-6">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    ) : (
                      <div className="w-6" />
                    )}

                    {/* Category Image */}
                    <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {category.image ? (
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <Folder className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                          onClick={() => onCategoryClick?.(category)}>
                          {category.name}
                        </h3>
                        {hasSubcategories && (
                          <Badge variant="secondary" className="text-xs">
                            {category.children!.length}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            category.isActive !== false
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs">
                          {category.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 truncate">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        /{category.slug}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-2">
                    {hasSubcategories && level < maxLevel && (
                      <Link
                        href={`/admin/categories/new?parent=${category.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditCategory?.(category)}
                      className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteCategory?.(category)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recursive Subcategories */}
            {hasSubcategories && isExpanded && level < maxLevel && (
              <div className="mt-2">
                <CategoryHierarchy
                  categories={category.children!}
                  onCategoryClick={onCategoryClick}
                  onEditCategory={onEditCategory}
                  onDeleteCategory={onDeleteCategory}
                  level={level + 1}
                  maxLevel={maxLevel}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
