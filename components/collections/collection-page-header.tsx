import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Collection } from "@prisma/client";

// Small base64 encoded version of your image for blur effect
const blurDataURL =
  "data:image/webp;base64,UklGRh4AAABXRUJQVlA4IBIAAAAwAQCdASoBAAEAAQAcJaQAA3AA/vtAAAA=";

interface CollectionPageHeaderProps {
  collection: Collection;
}

export function CollectionPageHeader({
  collection,
}: CollectionPageHeaderProps) {
  return (
    <div className="relative">
      <div className="relative h-32 md:h-40 lg:h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/40">
          <Image
            src="/collection-banner.webp"
            height={1000}
            width={1000}
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover w-full h-auto"
            alt="Collections page image"
          />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl text-white">
              <div className="mb-4">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">Back to Collections</span>
                </Link>
              </div>

              <h1 className="text-xl md:text-4xl font-bold mb-4 text-balance">
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
