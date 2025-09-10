import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collection } from "@prisma/client";

interface CollectionCardProps {
  collection: Collection & {
    productCount: number;
  };
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground group-hover:text-black/70 transition-colors">
              {collection.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {collection.productCount} products
            </p>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
            {collection.description}
          </p>
          <Link href={`/collections/${collection.slug}`} className="block">
            <Button
              variant="ghost"
              className="w-full font-medium border border-black"
              size="lg">
              Browse Collection
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
