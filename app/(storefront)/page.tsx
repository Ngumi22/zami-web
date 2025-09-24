import { getAllCategories } from "@/data/category";
import HomePageClient from "@/components/layout/homepage-client";
import { getBlogPosts } from "@/data/blog";
import { getCollectionsWithProducts } from "@/data/collections/collectionsPage";
import {
  getFlashSaleData,
  getAllProducts,
  getFeaturedProducts,
  newArrivals,
} from "@/data/fetch-all";

export default async function HomePage() {
  const [
    products,
    featuredProducts,
    newProducts,
    categories,
    flashSaleData,
    blogPosts,
    collections,
  ] = await Promise.all([
    getAllProducts(6),
    getFeaturedProducts(),
    newArrivals(),
    getAllCategories(),
    getFlashSaleData(),
    getBlogPosts(),
    getCollectionsWithProducts(),
  ]);

  const collectionsForHomepage = collections.map((collection) => ({
    ...collection,
    products: collection.products.map((poc: any) => poc.product),
    productCount: collection.productCount,
  }));

  return (
    <HomePageClient
      initialProducts={products}
      initialFeatured={featuredProducts}
      initialNewArrivals={newProducts}
      initialCategories={categories}
      initialFlashSaleData={flashSaleData}
      blogPosts={blogPosts}
      collections={collectionsForHomepage}
    />
  );
}
