import { CollectionPageHeader } from "@/components/collections/collection-page-header";
import { FilterSortBar } from "@/components/collections/filter-sort-bar";
import { FilteredProductGrid } from "@/components/collections/filtered-product-grid";
import { getCachedCategories } from "@/data/productspage/getProducts";
import { notFound } from "next/navigation";
import {
  getCollectionBySlug,
  getCollectionsWithProducts,
  getProducts,
} from "@/data/collections/collectionsPage";

interface CollectionPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    category?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    brands?: string | string[];
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

  const collection = await getCollectionBySlug(slug);
  const categories = await getCachedCategories();

  if (!collection) {
    notFound();
  }

  // Prepare filters for getProducts
  const filters = {
    collection: slug,
    category: category,
    sort: sort,
    priceMin: priceMin ? Number.parseFloat(priceMin) : undefined,
    priceMax: priceMax ? Number.parseFloat(priceMax) : undefined,
    brands: Array.isArray(brands) ? brands : brands ? [brands] : undefined,
    search: search,
  };

  // Get products with the collection filter
  const products = await getProducts(filters);

  const selectedCategory = category
    ? categories.find((c) => c.slug === category)
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <CollectionPageHeader collection={collection} />

      <div className="container mx-auto px-4 py-8">
        <FilterSortBar
          categories={categories}
          currentCategory={category}
          currentSort={sort}
          currentMinPrice={priceMin}
          currentMaxPrice={priceMax}
        />

        <FilteredProductGrid
          filters={{
            category: selectedCategory,
            sort: sort,
            minPrice: priceMin ? Number.parseFloat(priceMin) : undefined,
            maxPrice: priceMax ? Number.parseFloat(priceMax) : undefined,
          }}
          products={products.products}
          categories={categories}
        />
      </div>
    </div>
  );
}
