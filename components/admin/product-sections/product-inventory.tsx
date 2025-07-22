"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Product } from "@prisma/client";

interface ProductInventoryProps {
  product: Product;
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

export function ProductInventory({
  product,
  isEditing,
  onUpdate,
}: ProductInventoryProps) {
  const updateField = (field: keyof Product, value: any) => {
    onUpdate({ ...product, [field]: value });
  };

  const getTotalStock = () => {
    const baseStock = product.stock;
    const variantStock = (product.variants || []).reduce(
      (total, variant) => total + variant.stock,
      0
    );
    return baseStock + variantStock;
  };

  const getStockStatus = () => {
    const total = getTotalStock();
    if (total === 0)
      return { status: "out", color: "destructive", icon: AlertTriangle };
    if (total <= 10)
      return { status: "low", color: "secondary", icon: AlertTriangle };
    return { status: "good", color: "default", icon: CheckCircle };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Stock Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Base Stock
                </p>
                <p className="text-2xl font-bold">{product.stock}</p>
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
                <p className="text-2xl font-bold">
                  {(product.variants || []).reduce(
                    (total, variant) => total + variant.stock,
                    0
                  )}
                </p>
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
                  Total Stock
                </p>
                <p className="text-2xl font-bold">{getTotalStock()}</p>
              </div>
              <stockStatus.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <stockStatus.icon className="h-5 w-5" />
              <div>
                <p className="font-medium">
                  {stockStatus.status === "out" && "Out of Stock"}
                  {stockStatus.status === "low" && "Low Stock"}
                  {stockStatus.status === "good" && "In Stock"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stockStatus.status === "out" &&
                    "Product is currently unavailable"}
                  {stockStatus.status === "low" &&
                    "Stock is running low, consider restocking"}
                  {stockStatus.status === "good" && "Stock levels are healthy"}
                </p>
              </div>
            </div>
            <Badge variant={stockStatus.color as any}>
              {getTotalStock()} units
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stock">Base Stock Quantity</Label>
            {isEditing ? (
              <Input
                id="stock"
                type="number"
                value={product.stock}
                onChange={(e) =>
                  updateField("stock", Number.parseInt(e.target.value) || 0)
                }
                placeholder="0"
                min="0"
              />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {product.stock} units
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Base stock for the product without variants
            </p>
          </div>

          {/* Variant Stock Summary */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <Label>Variant Stock Breakdown</Label>
              <div className="mt-2 space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {variant.name}: {variant.value}
                      </p>
                      {variant.sku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {variant.sku}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {variant.stock} units
                      </p>
                      <Badge
                        variant={variant.stock > 0 ? "default" : "destructive"}
                        className="text-xs">
                        {variant.stock > 0 ? "In Stock" : "Out"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Variant stock is managed in the Variants tab
              </p>
            </div>
          )}

          {/* Stock Alerts */}
          <div>
            <Label>Stock Alerts</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Low stock threshold</span>
                <span className="text-sm text-muted-foreground">10 units</span>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Out of stock alerts</span>
                <Badge variant="outline" className="text-xs">
                  Enabled
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
