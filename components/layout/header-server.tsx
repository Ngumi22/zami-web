import { getAllCategories } from "@/data/category";

import React from "react";
import { SiteHeader } from "./header";

import { getFeaturedProducts } from "@/data/consolidated-products-fetch";
import { getAllBrands } from "@/data/cat";

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
