"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@/components/ui/use-toast";

import { Product, Brand, Category } from "@/generated/prisma/client";

interface ProductWithRelations extends Product {
  brand?: Brand;
  category?: Category;
}

interface CompareStore {
  items: ProductWithRelations[];
  maxItems: number;
  addItem: (product: ProductWithRelations) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ProductWithRelations) => void;
  isInCompare: (productId: string) => boolean;
  clearAll: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,
      addItem: (product) => {
        if (get().isInCompare(product.id)) return;
        if (get().items.length >= get().maxItems) {
          toast({
            title: "Compare List Full",
            description: `You can only compare up to ${
              get().maxItems
            } items. Please remove one first.`,
            variant: "destructive",
          });
          return;
        }
        set((state) => ({ items: [...state.items, product] }));
        toast({
          title: "Added to Compare",
          description: `${product.name} has been added for comparison.`,
        });
      },
      removeItem: (productId) => {
        const itemToRemove = get().items.find((p) => p.id === productId);
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
        if (itemToRemove) {
          toast({
            title: "Removed from Compare",
            description: `${itemToRemove.name} has been removed from comparison.`,
            variant: "destructive",
          });
        }
      },
      toggleItem: (product) => {
        if (get().isInCompare(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      isInCompare: (productId) => {
        return get().items.some((p) => p.id === productId);
      },
      clearAll: () => {
        set({ items: [] });
        toast({ title: "Compare List Cleared" });
      },
    }),
    {
      name: "compare-store",
    }
  )
);

export type { ProductWithRelations };
