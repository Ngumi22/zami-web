import { notFound } from "next/navigation";
import { CollectionPageHeader } from "@/components/collections/collection-page-header";
import { FilterSortBar } from "@/components/collections/filter-sort-bar";
import { FilteredProductGrid } from "@/components/collections/filtered-product-grid";
import {
  getCollectionBySlug,
  getCollectionsWithProducts,
} from "@/data/collections/collectionsPage";
import {
  getCachedBrands,
  getCachedCategories,
  getCollectionFilterData,
  getCollectionProducts,
} from "@/data/collections/collectionsPage";
import { Category } from "@prisma/client";

interface CollectionPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    category?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    brands?: string;
    search?: string;
  };
}

export async function generateStaticParams() {
  const collections = await getCollectionsWithProducts();
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: `${collection.name} Collection | Modern Ecommerce`,
    description:
      collection.description || `Browse our ${collection.name} collection`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const { category, sort, priceMin, priceMax, brands, search } =
    await searchParams;

  const [collection, categories, availableBrands, collectionFilterData] =
    await Promise.all([
      getCollectionBySlug(slug),
      getCachedCategories(),
      getCachedBrands(),
      getCollectionFilterData(slug),
    ]);

  if (!collection) {
    notFound();
  }

  const brandSlugs = brands ? brands.split(",") : undefined;

  const filters = {
    collection: slug,
    category: category === "all" ? undefined : category,
    sort: sort,
    priceMin: priceMin ? Number.parseFloat(priceMin) : undefined,
    priceMax: priceMax ? Number.parseFloat(priceMax) : undefined,
    brands: brandSlugs,
    search: search,
    perPage: 12,
    offset: 0,
  };

  const { products, totalProducts } = await getCollectionProducts(filters);

  return (
    <div className="min-h-screen bg-background">
      <CollectionPageHeader collection={collection} />

      <div className="container mx-auto px-4 py-8">
        <FilterSortBar
          categories={categories}
          availableBrands={availableBrands}
          totalProducts={totalProducts}
          priceRange={collectionFilterData.priceRange}
          currentSearch={search}
        />

        <FilteredProductGrid
          products={products}
          totalProducts={totalProducts}
          categories={categories}
          filters={{
            category:
              category && category !== "all"
                ? categories.find((cat: Category) => cat.slug === category)
                : undefined,
            sort: filters.sort,
            minPrice: filters.priceMin,
            maxPrice: filters.priceMax,
            brands: filters.brands,
            search: filters.search,
          }}
        />
      </div>
    </div>
  );
}
