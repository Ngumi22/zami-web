import { CollectionForm } from "@/components/admin/forms/collection/collection-form";
import { getCollectionById } from "@/data/collections/collectionsPage";
import { getAllProducts } from "@/data/product";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, products] = await Promise.all([
    getCollectionById(id),
    getAllProducts(4),
  ]);

  if (!collection) {
    return (
      <div className="max-w-5xl mx-auto py-4">
        <h1 className="text-2xl font-bold mb-6">Collection Not Found</h1>
        <p>The collection you're trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4">
      <CollectionForm collection={collection} products={products} />
    </div>
  );
}
