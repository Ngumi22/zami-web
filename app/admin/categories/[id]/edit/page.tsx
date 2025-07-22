import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCategories, getCategoryById } from "@/data/category";
import CategoryForm from "@/components/admin/category-sections/category-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditCategoryFormWrapper({ id }: { id: string }) {
  try {
    const [allCategories, category] = await Promise.all([
      getAllCategories(),
      getCategoryById(id),
    ]);

    if (!category) {
      console.log(`Category with ID "${id}" not found`);
      notFound();
    }

    return <CategoryForm category={category} allCategories={allCategories} />;
  } catch (error) {
    console.error("Error loading category:", error);
    notFound();
  }
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
        </CardContent>
      </Card>
    </div>
  );
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto py-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold tracking-tight">Edit Category</h1>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <EditCategoryFormWrapper id={id} />
      </Suspense>
    </div>
  );
}
