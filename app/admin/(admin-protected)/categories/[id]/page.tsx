import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Plus, Folder } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SpecificationDisplay } from "@/components/admin/category-sections/specification-display";
import { CategoryHierarchyWrapper } from "@/components/admin/category-sections/category-hierarchy-wrapper";
import { getCategoryWithPath } from "@/data/category";
import { CategoryDetailSkeleton } from "@/components/admin/category-sections/category-detail-skeleton";

interface CategoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function CategoryDetailContent({ categoryId }: { categoryId: string }) {
  const result = await getCategoryWithPath(categoryId);

  if (!result) {
    notFound();
  }

  const { category, path } = result;

  return (
    <div className="mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>

          {/* Breadcrumb */}
          {path.length > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {path.slice(0, -1).map((pathCategory, index) => (
                <div key={pathCategory.id} className="flex items-center gap-2">
                  <Link
                    href={`/admin/categories/${pathCategory.id}`}
                    className="hover:text-blue-600">
                    {pathCategory.name}
                  </Link>
                  <span className="text-gray-400">/</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/categories/${category.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-800">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
              {category.image ? (
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <Folder className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl">{category.name}</CardTitle>
                <Badge
                  variant={
                    category.isActive !== false ? "default" : "secondary"
                  }>
                  {category.isActive !== false ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">
                {category.description || "No description available"}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Slug:</span>
                  <p className="text-gray-600">/{category.slug}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <p className="text-gray-600">{category.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Parent:</span>
                  <p className="text-gray-600">{category.parentId || "None"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Subcategories:
                  </span>
                  <p className="text-gray-600">
                    {category.children?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Specifications */}
      {category.specifications && category.specifications.length > 0 && (
        <SpecificationDisplay
          specifications={category.specifications}
          title={`${category.name} Specifications`}
        />
      )}

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Subcategories</span>
              <Link href={`/admin/categories/new`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subcategory
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryHierarchyWrapper
              categories={category.children}
              level={0}
              maxLevel={5}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State for Subcategories */}
      {(!category.children || category.children.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Subcategories
            </h3>
            <p className="text-gray-600 mb-4">
              This category doesn't have any subcategories yet. Create one to
              organize your products better.
            </p>
            <Link href={`/admin/categories/new?parent=${category.id}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Subcategory
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<CategoryDetailSkeleton />}>
      <CategoryDetailContent categoryId={id} />
    </Suspense>
  );
}
