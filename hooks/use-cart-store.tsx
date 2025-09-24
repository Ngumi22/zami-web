"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------------------------
// utils/cart.ts
// ---------------------------
export function generateCartKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}-${variantId}` : productId;
}

// ---------------------------
// Types
// ---------------------------
export type CartReadyProduct = {
  id: string;
  slug: string;
  name: string;
  mainImage: string;
  stock: number;
  brand: string;
  category: string;
  basePrice: number;
  finalPrice: number;
  variantId?: string;
  variantName?: string;
};

export type CartItem = CartReadyProduct & {
  key: string;
  quantity: number;
};

type CartActionResult = { success: boolean; message?: string };

interface CartStore {
  items: CartItem[];
  cartCount: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  addItem: (
    product: CartReadyProduct,
    options?: { quantity?: number }
  ) => CartActionResult;
  removeItem: (key: string) => void;
  clearCart: () => void;
  updateQuantity: (key: string, quantity: number) => CartActionResult;
  isInCart: (productId: string, variantId?: string) => boolean;
}

// ---------------------------
// Store
// ---------------------------
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartCount: 0,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addItem: (product, options = {}) => {
        const { quantity = 1 } = options;
        const key = generateCartKey(product.id, product.variantId);

        const existing = get().items.find((item) => item.key === key);

        // case: already in cart
        if (existing) {
          const newQty = existing.quantity + quantity;
          if (newQty > product.stock) {
            toast.error("Not enough stock", {
              description: `Only ${product.stock} of ${product.name} available.`,
            });
            return { success: false, message: "Stock exceeded" };
          }

          const updatedItems = get().items.map((item) =>
            item.key === key ? { ...item, quantity: newQty } : item
          );

          set({
            items: updatedItems,
            cartCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          });

          toast.success("Cart updated", {
            description: `${product.name} quantity increased.`,
          });

          return { success: true, message: "Quantity increased" };
        }

        // case: new product
        if (quantity > product.stock) {
          toast.error("Not enough stock", {
            description: `Only ${product.stock} of ${product.name} available.`,
          });
          return { success: false, message: "Stock exceeded" };
        }

        const newItem: CartItem = {
          ...product,
          key,
          quantity,
        };

        const updatedItems = [...get().items, newItem];

        set({
          items: updatedItems,
          cartCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });

        toast.success("Item added", {
          description: `${product.name} was added to your cart.`,
        });

        return { success: true, message: "Item added" };
      },

      removeItem: (key) => {
        const updatedItems = get().items.filter((i) => i.key !== key);
        set({
          items: updatedItems,
          cartCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });

        toast("Item removed", {
          description: "The item was removed from your cart.",
        });
      },

      clearCart: () => {
        set({ items: [], cartCount: 0 });
        toast("Cart cleared");
      },

      updateQuantity: (key, quantity) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return { success: false, message: "Not found" };

        if (quantity <= 0) {
          get().removeItem(key);
          return { success: true, message: "Removed" };
        }

        if (quantity > item.stock) {
          const updatedItems = get().items.map((i) =>
            i.key === key ? { ...i, quantity: item.stock } : i
          );

          set({
            items: updatedItems,
            cartCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          });

          toast.error("Stock limit reached", {
            description: `Only ${item.stock} of ${item.name} available.`,
          });

          return {
            success: false,
            message: "Quantity adjusted to stock limit",
          };
        }

        const updatedItems = get().items.map((i) =>
          i.key === key ? { ...i, quantity } : i
        );

        set({
          items: updatedItems,
          cartCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        });

        toast.success("Quantity updated", {
          description: `${item.name} quantity set to ${quantity}.`,
        });

        return { success: true, message: "Quantity updated" };
      },

      isInCart: (productId, variantId) => {
        const key = generateCartKey(productId, variantId);
        return get().items.some((i) => i.key === key);
      },
    }),
    {
      name: "cart-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          state.cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        }
      },
    }
  )
);
