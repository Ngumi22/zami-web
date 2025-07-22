"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Product } from "@prisma/client";

interface ProductSEOProps {
  product: Product;
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

export function ProductSEO({ product, isEditing, onUpdate }: ProductSEOProps) {
  const updateField = (field: keyof Product, value: any) => {
    onUpdate({ ...product, [field]: value });
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !product.tags.includes(tag.trim())) {
      updateField("tags", [...product.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField(
      "tags",
      product.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const generateSlugFromName = () => {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    updateField("slug", slug);
  };

  return (
    <div className="space-y-6">
      {/* SEO Basics */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug</Label>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSlugFromName}>
                  Generate from name
                </Button>
              )}
            </div>
            {isEditing ? (
              <Input
                id="slug"
                value={product.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="product-url-slug"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {product.slug}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              URL: /products/{product.slug}
            </p>
          </div>

          <div>
            <Label htmlFor="shortDescription">Meta Description</Label>
            {isEditing ? (
              <Textarea
                id="shortDescription"
                value={product.shortDescription}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
                placeholder="Brief description for search engines"
                rows={3}
                maxLength={160}
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {product.shortDescription}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {product.shortDescription.length}/160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Product Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div>
              <Label htmlFor="newTag">Add Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  placeholder="Enter a tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(
                      "newTag"
                    ) as HTMLInputElement;
                    if (input) {
                      addTag(input.value);
                      input.value = "";
                    }
                  }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label>Current Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags added</p>
              ) : (
                product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1">
                    {tag}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Search Engine Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-1">
              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                {product.name}
              </div>
              <div className="text-green-700 text-sm">
                https://www.zami.co.ke/products/{product.slug}
              </div>
              <div className="text-gray-600 text-sm">
                {product.shortDescription || "No meta description set"}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is how your product might appear in search engine results
          </p>
        </CardContent>
      </Card>

      {/* Social Media Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-white w-1/2">
            <img
              src={product.mainImage || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=192&width=384";
              }}
            />
            <div className="p-4">
              <div className="font-medium text-lg">{product.name}</div>
              <div className="text-gray-600 text-sm mt-1">
                {product.shortDescription || "No description available"}
              </div>
              <div className="text-gray-500 text-xs mt-2">zami.co.ke</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is how your product might appear when shared on social media
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
