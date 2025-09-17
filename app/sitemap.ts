// app/sitemap.ts
import { getAllCategories } from "@/data/category";
import { getAllProducts } from "@/data/product";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://yourdomain.com";

  const staticPaths = [
    "",
    "/products",
    "/about",
    "/contact",
    "/blog",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  const staticUrls: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  }));

  const categories = await getAllCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`, // cleaner than query param
    lastModified: new Date(cat.updatedAt ?? new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const products = await getAllProducts();
  const productUrls: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.updatedAt ?? new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
