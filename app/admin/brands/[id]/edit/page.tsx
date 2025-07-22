import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBrandById } from "@/data/brands";
import BrandForm from "@/components/admin/brand-sections/brand-form";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Brand</h1>
          <p className="text-gray-600">Update brand information</p>
        </div>

        <BrandForm brand={brand} />
      </div>
    </Suspense>
  );
}
