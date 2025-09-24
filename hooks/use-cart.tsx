"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Key generator
export function generateCartKey(
  productId: string,
  variants?: Record<string, string>
): string {
  if (!variants || Object.keys(variants).length === 0) return productId;

  const variantKey = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, value]) => `${type}=${value}`)
    .join("&");

  return `${productId}-${variantKey}`;
}

// Cart types
export type CartItem = {
  key: string;
  id: string;
  name: string;
  slug: string;
  price: number;
  mainImage: string;
  quantity: number;
  stock: number;
  variants: Record<string, string>;
  categoryId: string;
  category?: string;
};

export type CartActionResult = {
  success: boolean;
  message?: string;
};

interface CartStore {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (item: CartItem) => CartActionResult;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => CartActionResult;
  clearCart: () => void;
  isInCart: (productId: string, variants?: Record<string, string>) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      addItem: (newItem) => {
        const existing = get().items.find((i) => i.key === newItem.key);
        if (existing) {
          const newQty = existing.quantity + newItem.quantity;
          if (newQty > existing.stock) {
            toast("Not enough stock", {
              description: `Only ${existing.stock} of ${existing.name} available.`,
            });
            return { success: false, message: "Stock exceeded" };
          }

          set({
            items: get().items.map((i) =>
              i.key === newItem.key ? { ...i, quantity: newQty } : i
            ),
          });

          toast("Cart Updated", {
            description: `${newItem.name} quantity increased.`,
          });

          return { success: true };
        }

        if (newItem.quantity > newItem.stock) {
          toast("Not enough stock", {
            description: `Only ${newItem.stock} of ${newItem.name} available.`,
          });
          return { success: false };
        }

        set({ items: [...get().items, newItem] });

        toast("Item Added", {
          description: `${newItem.name} was added to your cart.`,
        });

        return { success: true };
      },

      removeItem: (key) => {
        set({
          items: get().items.filter((i) => i.key !== key),
        });

        toast("Item Removed", {
          description: "The item was removed from your cart.",
        });
      },

      updateQuantity: (key, quantity) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return { success: false, message: "Not found" };

        if (quantity <= 0) {
          get().removeItem(key);
          return { success: true, message: "Removed" };
        }

        if (quantity > item.stock) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: item.stock } : i
            ),
          });

          toast("Stock limit reached", {
            description: `Only ${item.stock} of ${item.name} available.`,
          });

          return {
            success: false,
            message: "Quantity adjusted to stock limit",
          };
        }

        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity } : i
          ),
        });

        return { success: true, message: "Quantity updated" };
      },

      clearCart: () => {
        set({ items: [] });
        toast("Cart cleared");
      },

      isInCart: (productId, variants = {}) => {
        const key = generateCartKey(productId, variants);
        return get().items.some((i) => i.key === key);
      },
    }),
    {
      name: "cart-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
