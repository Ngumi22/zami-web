import {
  getAllProducts,
  getFeaturedProducts,
  newArrivals,
} from "@/data/product";
import { getAllCategories } from "@/data/category";
import HomePageClient from "@/components/layout/homepage-client";
import { getBlogPosts } from "@/data/blog";
import {
  getCollectionsWithProducts,
  getFlashSaleData,
} from "@/data/collections/collectionsPage";

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
    products: collection.products.map((poc) => poc.product),
    productCount: collection.productCount,
  }));

  return (
    <HomePageClient
      initialProducts={products}
      initialFeatured={featuredProducts}
      initialNewArrivals={newProducts}
      initialCategories={categories}
      flashSaleData={flashSaleData}
      blogPosts={blogPosts}
      collections={collectionsForHomepage}
    />
  );
}
