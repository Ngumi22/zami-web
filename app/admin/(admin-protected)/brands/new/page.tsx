import BrandForm from "@/components/admin/brand-sections/brand-form";

export default function NewBrandPage() {
  return (
    <div className="mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Add New Brand</h1>
        <p className="text-gray-600">Create a new product brand</p>
      </div>

      <BrandForm />
    </div>
  );
}
