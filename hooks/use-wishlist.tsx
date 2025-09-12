"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@/components/ui/use-toast";
import { Product } from "@prisma/client";

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (get().isInWishlist(product.id)) return;

        set((state) => ({
          items: [...state.items, product],
        }));
        toast({
          title: "Added to Wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      },

      removeItem: (productId) => {
        const itemToRemove = get().items.find((p) => p.id === productId);
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
        if (itemToRemove) {
          toast({
            title: "Removed from Wishlist",
            description: `${itemToRemove.name} has been removed from your wishlist.`,
            variant: "destructive",
          });
        }
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((p) => p.id === productId);
      },

      clearAll: () => {
        set({ items: [] });
        toast({ title: "Wishlist Cleared" });
      },
    }),
    {
      name: "wishlist-store",
    }
  )
);
