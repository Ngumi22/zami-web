"use client";

import {
  addProductsToFlashSale,
  createFlashSaleCollection,
} from "@/lib/flash-sale-actions";
import { AdminCollection } from "@/lib/types";
import { Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FlashSaleAdminProps {
  products: Product[];
  collections: AdminCollection[];
}

export function FlashSaleAdmin({ products, collections }: FlashSaleAdminProps) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName || selectedProducts.length === 0) {
      setMessage({
        type: "error",
        text: "Please provide a name and select at least one product",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await createFlashSaleCollection({
      name: newCollectionName,
      productIds: selectedProducts,
    });

    if (result.success) {
      setMessage({ type: "success", text: "Collection created successfully" });
      setNewCollectionName("");
      setSelectedProducts([]);
      router.refresh();
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to create collection",
      });
    }

    setIsLoading(false);
  };

  const handleAddToCollection = async () => {
    if (!selectedCollection || selectedProducts.length === 0) {
      setMessage({
        type: "error",
        text: "Please select a collection and at least one product",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await addProductsToFlashSale(
      selectedCollection,
      selectedProducts
    );

    if (result.success) {
      setMessage({
        type: "success",
        text: "Products added to collection successfully",
      });
      setSelectedProducts([]);
      router.refresh();
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to add products",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Flash Sale Management</h1>

      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Products ({products.length})
          </h2>
          <div className="border rounded-lg p-4 h-96 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleProductSelect(product.id)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span>
                  {product.name} - ${product.price} ({product.stock} in stock)
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedProducts.length} products
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Collections ({collections.length})
          </h2>
          <div className="border rounded-lg p-4 h-96 overflow-y-auto">
            {collections.map((collection) => (
              <div key={collection.id} className="mb-4 p-2 border-b">
                <h3 className="font-semibold">{collection.name}</h3>
                <p className="text-sm text-gray-600">
                  {collection.products.length} products • Created:{" "}
                  {new Date(collection.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="New collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            className="border p-2 mr-2 flex-1"
            disabled={isLoading}
          />
          <button
            onClick={handleCreateCollection}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
            {isLoading ? "Creating..." : "Create New Collection"}
          </button>
        </div>

        <div className="flex items-center">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="border p-2 mr-2 flex-1"
            disabled={isLoading}>
            <option value="">Select collection to add products</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddToCollection}
            disabled={!selectedCollection || isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
            {isLoading ? "Adding..." : "Add to Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}
