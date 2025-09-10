import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Collection } from "@prisma/client";

interface CollectionPageHeaderProps {
  collection: Collection;
}

export function CollectionPageHeader({
  collection,
}: CollectionPageHeaderProps) {
  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              {/* Breadcrumb */}
              <div className="mb-4">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">Back to Collections</span>
                </Link>
              </div>

              {/* Collection Info */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">
                {collection.name}
              </h1>
              <p className="text-lg md:text-xl text-white/90 text-pretty max-w-xl">
                {collection.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
