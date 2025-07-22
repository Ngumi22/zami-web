"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, GripVertical } from "lucide-react";
import { Product } from "@prisma/client";

interface ProductImageManagerProps {
  product: Product;
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

export function ProductImageManager({
  product,
  isEditing,
  onUpdate,
}: ProductImageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    e.preventDefault();
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
      {/* Main Image */}
      <Card>
        <CardHeader>
          <CardTitle>Main Product Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="mainImage">Main Image URL</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    id="mainImage"
                    type="url"
                    value={product.mainImage}
                    onChange={(e) => updateMainImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.mainImage}
                </p>
              )}
            </div>
            <div>
              <Label>Preview</Label>
              <div className="mt-1">
                <img
                  src={product.mainImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=192&width=256";
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Images */}
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
            <p className="text-center text-muted-foreground py-8">
              No thumbnail images added yet
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.thumbnailImages.map((image, index) => (
                <div
                  key={index}
                  className="space-y-2 p-4 border rounded-lg"
                  draggable={isEditing}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Thumbnail {index + 1}</Label>
                    <div className="flex items-center gap-1">
                      {isEditing && (
                        <>
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => removeThumbnailImage(index)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={image}
                      onChange={(e) =>
                        updateThumbnailImage(index, e.target.value)
                      }
                      placeholder="https://example.com/thumbnail.jpg"
                      className="text-xs"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground break-all">
                      {image}
                    </p>
                  )}
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=96&width=96";
                    }}
                  />
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
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
