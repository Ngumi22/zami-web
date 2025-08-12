"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Upload,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import { Product } from "@prisma/client";
import Image from "next/image";

interface ProductImageManagerProps {
  product: Product;
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

// A reusable component for rendering an image with a placeholder fallback.
function ImagePreview({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  // If there's an error or no src, display a placeholder.
  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg ${className}`}>
        <ImageIcon className="w-1/4 h-1/4" />
        <span className="text-xs mt-2">No Image</span>
      </div>
    );
  }

  // Otherwise, render the image.
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover rounded-lg ${className}`}
      onError={handleError}
    />
  );
}

export function ProductImageManager({
  product,
  isEditing,
  onUpdate,
}: ProductImageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // --- State Update Handlers ---
  const updateMainImage = (url: string) => {
    onUpdate({ ...product, mainImage: url });
  };

  const updateThumbnailImage = (index: number, url: string) => {
    const thumbnails = [...(product.thumbnailImages || [])];
    thumbnails[index] = url;
    onUpdate({ ...product, thumbnailImages: thumbnails });
  };

  const addThumbnailImage = () => {
    const thumbnails = [...(product.thumbnailImages || []), ""];
    onUpdate({ ...product, thumbnailImages: thumbnails });
  };

  const removeThumbnailImage = (index: number) => {
    const thumbnails = (product.thumbnailImages || []).filter(
      (_, i) => i !== index
    );
    onUpdate({ ...product, thumbnailImages: thumbnails });
  };

  // --- Drag and Drop Handlers ---
  const reorderThumbnails = (fromIndex: number, toIndex: number) => {
    const thumbnails = [...(product.thumbnailImages || [])];
    const [removed] = thumbnails.splice(fromIndex, 1);
    thumbnails.splice(toIndex, 0, removed);
    onUpdate({ ...product, thumbnailImages: thumbnails });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping.
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderThumbnails(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Main Image Management */}
      <Card>
        <CardHeader>
          <CardTitle>Main Product Image</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
          {/* Main Image Preview */}
          <div className="w-full">
            <div className="aspect-square relative w-full border rounded-lg overflow-hidden">
              <ImagePreview
                src={product.mainImage}
                alt={product.name}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Main Image Editor */}
          <div className="space-y-4">
            <Label htmlFor="mainImage">Main Image URL</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  id="mainImage"
                  type="url"
                  value={product.mainImage || ""}
                  onChange={(e) => updateMainImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground break-all">
                {product.mainImage || "No main image URL provided."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Images Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thumbnail Images</CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addThumbnailImage}>
                <Plus className="w-4 h-4 mr-2" />
                Add Thumbnail
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!product.thumbnailImages || product.thumbnailImages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              <p>No thumbnail images added yet.</p>
              {isEditing && (
                <Button variant="link" onClick={addThumbnailImage}>
                  Add the first one
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(product.thumbnailImages || []).map((image, index) => (
                <div
                  key={index}
                  className={`relative group border rounded-lg p-2 space-y-2 transition-all ${
                    isEditing ? "cursor-grab" : ""
                  } ${
                    draggedIndex === index
                      ? "opacity-50 scale-95"
                      : "opacity-100"
                  }`}
                  draggable={isEditing}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}>
                  {/* Image Preview */}
                  <div className="aspect-square w-full overflow-hidden rounded-md">
                    <ImagePreview
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Edit Mode Controls */}
                  {isEditing && (
                    <>
                      <Label
                        htmlFor={`thumb-${index}`}
                        className="text-xs font-light">
                        Thumbnail {index + 1}
                      </Label>
                      <Input
                        id={`thumb-${index}`}
                        type="url"
                        value={image}
                        onChange={(e) =>
                          updateThumbnailImage(index, e.target.value)
                        }
                        placeholder="Image URL"
                        className="text-xs h-8"
                      />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => removeThumbnailImage(index)}>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Remove</span>
                        </Button>
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
