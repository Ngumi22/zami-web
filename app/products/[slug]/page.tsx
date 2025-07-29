import { Metadata } from "next";
import { getProductBySlug } from "@/data/product";
import { getAllProducts } from "@/data/product";
import ProductPageClient from "@/components/products/product-page-client";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = await params;
  return <ProductPageClient params={slug} />;
}
