import {
  getAllProducts,
  getFeaturedProducts,
  newArrivals,
} from "@/data/product";
import { getAllCategories } from "@/data/category";
import dynamic from "next/dynamic";

const HomePageClient = dynamic(
  () => import("@/components/products/homepage-client")
);

export default async function HomePage() {
  const [products, featuredProducts, newProducts, categories] =
    await Promise.all([
      getAllProducts(6),
      getFeaturedProducts(6),
      newArrivals(8),
      getAllCategories(),
    ]);

  return (
    <HomePageClient
      initialProducts={products}
      initialFeatured={featuredProducts}
      initialNewArrivals={newProducts}
      initialCategories={categories}
    />
  );
}
