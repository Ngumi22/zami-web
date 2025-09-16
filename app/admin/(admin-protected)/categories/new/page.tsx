import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCategories, getCategoryById } from "@/data/category";
import CategoryForm from "@/components/admin/category-sections/category-form";

interface PageProps {
  searchParams: Promise<{ parent?: string }>;
}

async function CategoryFormWrapper({
  searchParams,
}: {
  searchParams: { parent?: string };
}) {
  const [allCategories, parentCategory] = await Promise.all([
    getAllCategories(),
    searchParams.parent ? getCategoryById(searchParams.parent) : null,
  ]);

  if (searchParams.parent && !parentCategory) {
    notFound();
  }

  return (
    <CategoryForm
      allCategories={allCategories}
      parentCategory={parentCategory || undefined}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function NewCategoryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto py-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold tracking-tight">
          {resolvedSearchParams.parent
            ? "Create Subcategory"
            : "Create Category"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {resolvedSearchParams.parent
            ? "Add a new subcategory to organize your products better"
            : "Create a new category to organize your products"}
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <CategoryFormWrapper searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
