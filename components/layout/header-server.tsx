import { getAllCategories } from "@/data/category";
import { getFeaturedProducts } from "@/data/product";
import React from "react";
import { SiteHeader } from "./header";
import { getAllBrands } from "@/data/brands";

export default async function Header() {
  const [categories, products, brands] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(),
    getAllBrands(),
  ]);
  return (
    <SiteHeader
      categories={categories}
      products={products}
      popularBrands={brands}
    />
  );
}
