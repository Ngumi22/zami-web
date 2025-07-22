import type { Metadata } from "next";
import { WishlistContent } from "@/components/wishlist/wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved products and favorites",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              Save your favorite products for later
            </p>
          </div>
          <WishlistContent />
        </div>
      </main>
    </div>
  );
}
