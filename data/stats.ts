"use server";

import prisma from "@/lib/prisma";

export async function getProductsStats() {
  try {
    const totalProducts = await prisma.product.count();

    const featuredProducts = await prisma.product.count({
      where: { featured: true },
    });

    const outOfStockProducts = await prisma.product.count({
      where: { stock: 0 },
    });

    const lowStockProducts = await prisma.product.count({
      where: { stock: { gt: 0, lte: 10 } },
    });

    const products = await prisma.product.findMany({
      select: { price: true, stock: true, variants: true },
    });

    const totalValue = products.reduce(
      (sum: number, p: { price: any; stock: any }) =>
        sum + (p.price ?? 0) * (p.stock ?? 0),
      0
    );

    const productsWithVariants = products.filter(
      (p: { variants: string | any[] }) => p.variants && p.variants.length > 0
    ).length;

    const totalVariants = products.reduce(
      (sum: any, p: { variants: string | any[] }) =>
        sum + (p.variants?.length || 0),
      0
    );

    return {
      totalProducts,
      featuredProducts,
      outOfStockProducts,
      lowStockProducts,
      totalValue,
      productsWithVariants,
      totalVariants,
    };
  } catch (error) {
    return {
      totalProducts: 0,
      featuredProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
      totalValue: 0,
      productsWithVariants: 0,
      totalVariants: 0,
    };
  }
}
