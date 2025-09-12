import CollectionsHeader from "@/components/collections/collection-header";
import CollectionsGrid from "@/components/collections/collections-grid";
import { getCollectionsWithProducts } from "@/data/collections/collectionsPage";

export const metadata = {
  title: "Collections | Modern Ecommerce",
  description:
    "Discover our curated collections of premium products across various categories.",
};

export default async function CollectionsPage() {
  const collections = await getCollectionsWithProducts();

  return (
    <div className="min-h-screen bg-background">
      <CollectionsHeader />
      <div className="container mx-auto px-4 py-6">
        <CollectionsGrid collections={collections} />
      </div>
    </div>
  );
}
