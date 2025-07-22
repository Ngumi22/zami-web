import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetails } from "@/components/products/product-details";
import { FrequentlyBoughtTogether } from "@/components/products/frequently-bought-together";
import {
  getAllFullProducts,
  getFullProductBySlug,
  getProductBySlug,
  getProductsWithFilters,
} from "@/data/product";
import RelatedProducts from "@/components/products/related-products";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await getAllFullProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getFullProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, allProducts] = await Promise.all([
    getProductsWithFilters({ category: product.categoryId, limit: 4 }),
    getProductsWithFilters({ limit: 3 }),
  ]);

  const filteredRelatedProducts = relatedProducts.filter(
    (p) => p.id !== product.id
  );
  const suggestedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProductDetails product={product} />

        <FrequentlyBoughtTogether
          mainProduct={product}
          suggestedProducts={suggestedProducts}
        />
        <RelatedProducts products={filteredRelatedProducts} />
      </main>
    </div>
  );
}

export const revalidate = 3600;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      images: [
        {
          url: product.mainImage || "/placeholder.svg",
          width: 800,
          height: 600,
          alt: product.slug,
        },
      ],
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "KES",
    },
  };
}
