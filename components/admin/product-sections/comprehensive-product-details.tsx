"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Eye, Save, X } from "lucide-react";
import { updateProduct, deleteProduct } from "@/lib/product-actions";
import { useToast } from "@/hooks/use-toast";
import { ProductBasicInfo } from "./product-basic-info";
import { ProductImageManager } from "./product-image-manager";
import { ProductVariantManager } from "./product-variant-manager";
import { ProductSpecifications } from "./product-specifications";
import { ProductInventory } from "./product-inventory";
import { ProductSEO } from "./product-seo";
import { Brand, Category, Product } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailsProps {
  products: Product[];
  product: Product;
  categories: Category[];
  brands: Brand[];
}

export function ProductDetails({
  product,
  categories,
  brands,
}: ProductDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  // Keeps a deep copy of the original so we can rollback if the update fails
  const previousProductRef = useRef<Product>(
    JSON.parse(JSON.stringify(product))
  );

  // keeps editedProduct in sync when parent product prop changes (e.g. navigation / refresh)
  useEffect(() => {
    setEditedProduct(product);
    previousProductRef.current = JSON.parse(JSON.stringify(product));
  }, [product]);

  const category = categories.find((c) => c.id === editedProduct.categoryId);

  useEffect(() => {
    if (category && Array.isArray(category.specifications)) {
      setEditedProduct((currentProduct) => {
        const existingSpecs = currentProduct.specifications;
        let newSpecs: Record<string, any> = {};

        if (
          existingSpecs &&
          typeof existingSpecs === "object" &&
          !Array.isArray(existingSpecs)
        ) {
          newSpecs = { ...existingSpecs };
        } else if (Array.isArray(existingSpecs)) {
          newSpecs = existingSpecs.reduce((acc, item) => {
            if (item && typeof item === "object" && "value" in item) {
              const key = (item as any).id || (item as any).name;
              acc[String(key)] = (item as any).value;
            }
            return acc;
          }, {} as Record<string, any>);
        }

        category.specifications.forEach((spec: any) => {
          if (spec && spec.id && !newSpecs.hasOwnProperty(spec.id)) {
            newSpecs[spec.id] = spec.type === "BOOLEAN" ? false : "";
          }
        });

        if (
          JSON.stringify(currentProduct.specifications) !==
          JSON.stringify(newSpecs)
        ) {
          return { ...currentProduct, specifications: newSpecs };
        }

        return currentProduct;
      });
    }
  }, [category]);

  const brand = brands.find((b) => b.id === editedProduct.brandId);

  const handleSave = async () => {
    // Saves a snapshot of current server-known product for safe rollback
    previousProductRef.current = JSON.parse(JSON.stringify(product));

    // Immediately apply UI changes (editedProduct already reflects the changes),
    // close the editor to create a snappy feel.
    setIsSaving(true);
    setIsEditing(false);

    toast({
      title: "Saving…",
      description: "Applying your changes. This may take a moment.",
    });

    try {
      const productData = {
        name: editedProduct.name,
        slug: editedProduct.slug,
        shortDescription: editedProduct.shortDescription,
        description: editedProduct.description,
        price: editedProduct.price,
        originalPrice: editedProduct.originalPrice,
        mainImage: editedProduct.mainImage,
        thumbnailImages: editedProduct.thumbnailImages || [],
        categoryId: editedProduct.categoryId,
        brandId: editedProduct.brandId,
        stock: editedProduct.stock,
        featured: !!editedProduct.featured,
        specifications:
          typeof editedProduct.specifications === "object" &&
          editedProduct.specifications !== null &&
          !Array.isArray(editedProduct.specifications)
            ? (editedProduct.specifications as Record<string, string>)
            : {},
        variants: editedProduct.variants || [],
        tags: editedProduct.tags,
      };

      const result = await updateProduct(product.id, productData);

      if (result.success) {
        toast({
          title: "✅ Product updated",
          description: result.message || "Changes saved.",
        });
      } else {
        // Back to previous product state on server-declared failure
        setEditedProduct(previousProductRef.current);
        setIsEditing(true);
        toast({
          title: "⚠️ Update failed",
          description: result.message || "Unable to update the product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // rollback on network / unexpected error
      setEditedProduct(previousProductRef.current);
      setIsEditing(true);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      toast({
        title: "❌ Delete canceled",
        description: "Product deletion was canceled.",
      });
      return;
    }

    setIsDeleting(true);

    toast({ title: "Deleting…", description: "Removing product…" });

    try {
      const result = await deleteProduct(product.id);

      if (result.success) {
        toast({
          title: "🗑 Product deleted",
          description: result.message || "Product removed.",
        });
        router.push("/admin/products");
      } else {
        toast({
          title: "⚠️ Delete failed",
          description: result.message || "Unable to delete the product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setIsEditing(false);
    toast({
      title: "✏️ Edits canceled",
      description: "All changes have been reverted.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {editedProduct.name}
            </h1>
            <p className="text-muted-foreground">
              {category?.name} • {brand?.name} • {editedProduct.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open(`/products/${product.id}`, "_blank")
                }>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(editedProduct.price)}
                </p>
                {editedProduct.originalPrice && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(editedProduct.originalPrice)}
                  </p>
                )}
              </div>
              <Badge
                variant={
                  editedProduct.originalPrice ? "destructive" : "secondary"
                }>
                {editedProduct.originalPrice ? "Sale" : "Regular"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stock
                </p>
                <p className="text-2xl font-bold">{editedProduct.stock}</p>
              </div>
              <Badge
                variant={
                  editedProduct.stock > 10
                    ? "default"
                    : editedProduct.stock > 0
                    ? "secondary"
                    : "destructive"
                }>
                {editedProduct.stock > 10
                  ? "In Stock"
                  : editedProduct.stock > 0
                  ? "Low Stock"
                  : "Out of Stock"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Variants
                </p>
                <p className="text-2xl font-bold">
                  {editedProduct.variants?.length || 0}
                </p>
              </div>
              <Badge variant="outline">Options</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-sm font-medium">
                  {editedProduct.featured ? "Featured" : "Regular"}
                </p>
              </div>
              <Badge variant={editedProduct.featured ? "default" : "secondary"}>
                {editedProduct.featured ? "Featured" : "Regular"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w- grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <ProductBasicInfo
            product={editedProduct}
            categories={categories}
            brands={brands}
            isEditing={isEditing}
            onUpdate={setEditedProduct}
          />
        </TabsContent>

        <TabsContent value="images">
          <ProductImageManager
            product={editedProduct}
            isEditing={isEditing}
            onUpdate={setEditedProduct}
          />
        </TabsContent>

        <TabsContent value="variants">
          <ProductVariantManager
            product={editedProduct}
            isEditing={isEditing}
            onUpdate={setEditedProduct}
          />
        </TabsContent>

        <TabsContent value="specifications">
          <ProductSpecifications
            product={editedProduct}
            category={category}
            isEditing={isEditing}
            onUpdate={setEditedProduct}
          />
        </TabsContent>

        <TabsContent value="inventory">
          <ProductInventory
            product={editedProduct}
            isEditing={isEditing}
            onUpdate={setEditedProduct}
          />
        </TabsContent>

        <TabsContent value="seo">
          <ProductSEO
            product={editedProduct}
            isEditing={isEditing}
            onUpdate={setEditedProduct}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
