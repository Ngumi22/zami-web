import { Collection } from "@prisma/client";
import CollectionCard from "./collection-card";

interface CollectionsGridProps {
  collections: (Collection & {
    productCount: number;
  })[];
}

export default function CollectionsGrid({ collections }: CollectionsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
