"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, DollarSign } from "lucide-react";

import { Product, ProductVariant } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface ProductVariantManagerProps {
  product: Product;
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

export function ProductVariantManager({
  product,
  isEditing,
  onUpdate,
}: ProductVariantManagerProps) {
  const variants = product.variants || [];

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: "",
      type: "",
      value: "",
      priceModifier: 0,
      stock: 0,
      sku: "",
    };
    onUpdate({ ...product, variants: [...variants, newVariant] });
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    onUpdate({ ...product, variants: updatedVariants });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onUpdate({ ...product, variants: updatedVariants });
  };

  const getTotalVariantStock = () => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getVariantsByType = () => {
    const grouped: Record<string, ProductVariant[]> = {};
    variants.forEach((variant) => {
      if (!grouped[variant.type]) {
        grouped[variant.type] = [];
      }
      grouped[variant.type].push(variant);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      {/* Variant Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Variants
                </p>
                <p className="text-2xl font-bold">{variants.length}</p>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Variant Stock
                </p>
                <p className="text-2xl font-bold">{getTotalVariantStock()}</p>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price Range
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    Math.min(
                      ...variants.map((v) => product.price + v.priceModifier)
                    )
                  )}{" "}
                  -
                  {formatCurrency(
                    Math.max(
                      ...variants.map((v) => product.price + v.priceModifier)
                    )
                  )}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variant Types Overview */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variant Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getVariantsByType()).map(
                ([type, typeVariants]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{type}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {typeVariants.map((variant) => (
                          <Badge
                            key={variant.id}
                            variant="outline"
                            className="text-xs">
                            {variant.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {typeVariants.length} options
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock:{" "}
                        {typeVariants.reduce((sum, v) => sum + v.stock, 0)}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Variants</CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No variants added yet</p>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Variant
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeVariant(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <Label className="text-xs">Name</Label>
                      {isEditing ? (
                        <Input
                          value={variant.name}
                          onChange={(e) =>
                            updateVariant(index, "name", e.target.value)
                          }
                          placeholder="e.g., Color"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">Type</Label>
                      {isEditing ? (
                        <Input
                          value={variant.type}
                          onChange={(e) =>
                            updateVariant(index, "type", e.target.value)
                          }
                          placeholder="e.g., color"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">Value</Label>
                      {isEditing ? (
                        <Input
                          value={variant.value}
                          onChange={(e) =>
                            updateVariant(index, "value", e.target.value)
                          }
                          placeholder="e.g., Red"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.value}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">Price Modifier</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.priceModifier}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "priceModifier",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.priceModifier >= 0 ? "+" : " "}
                          {formatCurrency(variant.priceModifier)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">Stock</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "stock",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.stock}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">SKU</Label>
                      {isEditing ? (
                        <Input
                          value={variant.sku || ""}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                          placeholder="SKU-001"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.sku || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            variant.stock > 0 ? "default" : "destructive"
                          }>
                          {variant.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {variant.sku && (
                          <span className="text-xs text-muted-foreground">
                            SKU: {variant.sku}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(
                            product.price + variant.priceModifier
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Base: {formatCurrency(product.price)}{" "}
                          {variant.priceModifier >= 0 ? "+" : ""}
                          {formatCurrency(variant.priceModifier)}
                        </p>
                      </div>
                    </div>
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
