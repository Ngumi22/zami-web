"use client";

import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Folder } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "../data-table";
import { Category as PrismaCategory } from "@prisma/client";
import { deleteCategory } from "@/lib/category-actions";

export interface Category extends PrismaCategory {
  children?: Category[];
}

interface CategoriesTableProps {
  categories: Category[];
  showSubcategories?: boolean;
  parentCategory?: Category;
}

export default function CategoriesTable({
  categories,
  showSubcategories = false,
  parentCategory,
}: CategoriesTableProps) {
  const router = useRouter();

  const displayCategories = showSubcategories
    ? categories
    : categories.filter((cat) => !cat.parentId);

  const columns = [
    {
      key: "image" as keyof Category,
      label: "Image",
      width: "80px",
      render: (value: string, category: Category) => (
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {value ? (
            <Image
              src={value || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <Folder className="w-6 h-6 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "name" as keyof Category,
      label: "Name",
      sortable: true,
      render: (value: string, category: Category) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{value}</div>
          {category.children && category.children.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {category.children.length} sub
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "slug" as keyof Category,
      label: "Slug",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const],
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: "description" as keyof Category,
      label: "Description",
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      searchable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600 truncate max-w-xs block">
          {value || "No description"}
        </span>
      ),
    },

    {
      key: "isActive" as keyof Category,
      label: "Status",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const],
      render: (value: boolean) => (
        <Badge variant={value !== false ? "default" : "secondary"}>
          {value !== false ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      label: "View Details",
      onClick: (category: Category) => {
        router.push(`/admin/categories/${category.id}`);
      },
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Edit Category",
      onClick: (category: Category) => {
        router.push(`/admin/categories/${category.id}/edit`);
      },
      icon: <Edit className="w-4 h-4" />,
    },
    {
      label: "Delete Category",
      onClick: async (category: Category) => {
        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
          console.log("Delete category:", category);
          // Implement delete API call here
          await deleteCategory(category.id);
        }
      },
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ];

  const handleSelectionChange = (selectedCategories: Category[]) => {
    console.log("Selected categories:", selectedCategories);
  };

  const handleRowClick = (category: Category) => {
    router.push(`/admin/categories/${category.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {parentCategory && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/categories")}
                  className="text-blue-600 hover:text-blue-800">
                  All Categories
                </Button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{parentCategory.name}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-bold">
            {parentCategory
              ? `${parentCategory.name} - Subcategories`
              : "Categories"}
          </h1>
          <p className="text-gray-600">
            {parentCategory
              ? `Manage subcategories under ${parentCategory.name}`
              : "Manage product categories and their hierarchy"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories/new${
              parentCategory ? `?parent=${parentCategory.id}` : ""
            }`}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add {parentCategory ? "Subcategory" : "Category"}
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        data={displayCategories}
        columns={columns}
        actions={actions}
        searchable={true}
        filterable={true}
        selectable={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        emptyMessage={
          parentCategory
            ? `No subcategories found under ${parentCategory.name}. Create your first subcategory to get started.`
            : "No categories found. Create your first category to get started."
        }
        className="bg-white"
      />
    </div>
  );
}
