"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Brand, Category, Product } from "@prisma/client";
import RichTextEditor from "../forms/products/Editor";

interface ProductBasicInfoProps {
  product: Product;
  categories: Category[];
  brands: Brand[];
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

export function ProductBasicInfo({
  product,
  categories,
  brands,
  isEditing,
  onUpdate,
}: ProductBasicInfoProps) {
  const updateField = (field: keyof Product, value: any) => {
    onUpdate({ ...product, [field]: value });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={product.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter product name"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {product.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            {isEditing ? (
              <Textarea
                id="shortDescription"
                value={product.shortDescription}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
                placeholder="Brief product description"
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Full Description</Label>
            {isEditing ? (
              <RichTextEditor
                value={product.description}
                onChange={(value) => updateField("description", value)}
                className="min-h-[200px]"
              />
            ) : (
              <div className="text-sm text-muted-foreground mt-1 prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category & Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="categoryId">Category</Label>
            {isEditing ? (
              <Select
                value={product.categoryId}
                onValueChange={(value) => updateField("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {categories.find((c) => c.id === product.categoryId)?.name ||
                  "Unknown"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="brandId">Brand</Label>
            {isEditing ? (
              <Select
                value={product.brandId}
                onValueChange={(value) => updateField("brandId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {brands.find((b) => b.id === product.brandId)?.name ||
                  "Unknown"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              {isEditing ? (
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) =>
                    updateField("price", Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(product.price)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="originalPrice">Original Price</Label>
              {isEditing ? (
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={product.originalPrice || ""}
                  onChange={(e) =>
                    updateField(
                      "originalPrice",
                      e.target.value
                        ? Number.parseFloat(e.target.value)
                        : undefined
                    )
                  }
                  placeholder="0.00"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.originalPrice
                    ? `${formatCurrency(product.originalPrice)}`
                    : "Not set"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Checkbox
                id="featured"
                checked={product.featured}
                onCheckedChange={(checked) => updateField("featured", checked)}
              />
            ) : (
              <div className="w-4 h-4 border rounded flex items-center justify-center">
                {product.featured && (
                  <div className="w-2 h-2 bg-primary rounded" />
                )}
              </div>
            )}
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          <div>
            <Label>Created</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(product.createdAt).toISOString().split("T")[0]}
            </p>
          </div>

          <div>
            <Label>Last Updated</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(product.createdAt).toISOString().split("T")[0]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
