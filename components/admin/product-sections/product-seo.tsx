"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Search, Share2 } from "lucide-react";
import { Product } from "@prisma/client";
import Image from "next/image";

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
    <div className="grid gap-6 lg:grid-cols-2">
      {/* SEO Fields Column */}
      <div className="space-y-6">
        {/* SEO Basics */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              SEO Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
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
                <p className="font-mono bg-muted p-2 rounded-md text-sm break-all">
                  {product.slug}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Full URL: https://www.zami.co.ke/products/{product.slug}
              </p>
            </div>
            <div>
              <Label htmlFor="shortDescription" className="mb-2 block">
                Meta Description
              </Label>
              {isEditing ? (
                <Textarea
                  id="shortDescription"
                  value={product.shortDescription}
                  onChange={(e) =>
                    updateField("shortDescription", e.target.value)
                  }
                  placeholder="A brief description for search engines (max 160 characters)"
                  rows={3}
                  maxLength={160}
                />
              ) : (
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md min-h-[80px]">
                  {product.shortDescription || "No meta description set"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {product.shortDescription.length}/160 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Product Tags</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add keywords to improve search relevance.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  placeholder="Enter a tag and press Enter"
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
                  size="icon"
                  variant="secondary"
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
            )}
            <div className="flex flex-wrap gap-2">
              {product.tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags added</p>
              ) : (
                product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 p-2">
                    {tag}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 opacity-70 hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Column */}
      <div className="space-y-6">
        {/* SEO Preview */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              Search Engine Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-1">
                <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer font-medium">
                  {product.name}
                </div>
                <div className="text-green-700 dark:text-green-400 text-sm">
                  https://www.zami.co.ke/products/{product.slug}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {product.shortDescription ||
                    "This is a placeholder description. Add a meta description to make your product more appealing in search results."}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is how your product might appear in search engine results.
            </p>
          </CardContent>
        </Card>

        {/* Social Media Preview */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-muted-foreground" />
              Social Media Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 w-full md:w-3/4 lg:w-2/3">
              <Image
                src={product.mainImage}
                alt={product.name}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="p-4 space-y-1">
                <div className="font-bold text-lg">{product.name}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {product.shortDescription ||
                    "No description available. Provide a brief summary to encourage clicks."}
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-xs pt-2">
                  zami.co.ke
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is how your product might appear when shared on platforms
              like X or Facebook.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
