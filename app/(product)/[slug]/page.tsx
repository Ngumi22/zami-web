import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetails } from "@/components/products/product-details";
import { FrequentlyBoughtTogether } from "@/components/products/frequently-bought-together";
import {
  getAllFullProducts,
  getFrequentlyBoughtTogetherProducts,
  getFullProductBySlug,
  getRelatedProducts,
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getFullProductBySlug(slug);
  if (!product) notFound();
  const filteredRelatedProducts = await getRelatedProducts(product.id);
  const suggestedProducts = await getFrequentlyBoughtTogetherProducts(
    product.id
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 order-2 lg:order-1">
              <div className="p-4 lg:p-6 h-full">
                <RelatedProducts products={filteredRelatedProducts} />
              </div>
            </div>

            <div className="lg:w-3/4 order-1 lg:order-2">
              <div className="p-4 lg:p-6">
                <ProductDetails product={product} />
              </div>
            </div>
          </div>
        </div>

        {suggestedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 lg:p-6">
              <FrequentlyBoughtTogether
                mainProduct={product}
                suggestedProducts={suggestedProducts}
              />
            </div>
          </div>
        )}
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

  const product = await getFullProductBySlug(slug);

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
