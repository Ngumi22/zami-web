import { CollectionForm } from "@/components/admin/forms/collection/collection-form";
import { getAllProducts } from "@/data/product";

export default async function NewCollectionPage() {
  const products = await getAllProducts();

  return (
    <div className="max-w-5xl mx-auto py-4">
      <CollectionForm products={products} />
    </div>
  );
}
