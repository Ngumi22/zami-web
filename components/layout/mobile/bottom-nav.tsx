import { getAllCategories } from "@/data/category";
import { getAllProducts } from "@/data/product";
import React from "react";
import { BottomNavigation } from "./bottom-navigation";

export default async function BottomNav() {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
  ]);
  return <BottomNavigation categories={categories} products={products} />;
}
