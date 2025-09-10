"use client";

import { useState, useActionState, useEffect, useOptimistic } from "react";
import type { Collection } from "@prisma/client";
import {
  type ActionResult,
  createCollection,
  updateCollection,
} from "@/lib/collection-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface CollectionFormProps {
  collection?: Collection & {
    products: {
      productId: string;
    }[];
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    mainImage: string;
  }>;
  onSuccess?: () => void;
}

const createCollectionAction = createCollection;
const updateCollectionAction =
  (id: string) => (prevState: ActionResult | null, formData: FormData) =>
    updateCollection(id, prevState, formData);

export function CollectionForm({
  collection,
  products,
  onSuccess,
}: CollectionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    collection?.products.map((p) => p.productId) || []
  );

  const [optimisticState, addOptimistic] = useOptimistic(
    { isSubmitting: false },
    (state, newState: { isSubmitting: boolean }) => ({ ...state, ...newState })
  );

  const [state, formAction, isPending] = useActionState(
    collection ? updateCollectionAction(collection.id) : createCollectionAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success",
        description: collection
          ? "Collection updated successfully"
          : "Collection created successfully",
      });

      if (!collection) {
        setSelectedProductIds([]);
        const form = document.querySelector("form");
        if (form) {
          form.reset();
        }
      }

      onSuccess?.();

      if (
        state.message == "Collection updated successfully" ||
        state.message == "Collection created successfully"
      ) {
        router.push(`/admin/collections`);
      }
    } else if (state?.message && !state?.success) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, collection, toast, onSuccess]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (formData: FormData) => {
    addOptimistic({ isSubmitting: true });
    await formAction(formData);
    addOptimistic({ isSubmitting: false });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="bg-black">
          {collection ? "Update Collection" : "Create New Collection"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <input
            type="hidden"
            name="productIds"
            value={JSON.stringify(selectedProductIds)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={collection?.name}
                placeholder="Enter collection name"
                required
              />
              {state?.errors?.name && (
                <p className="text-sm text-destructive">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={collection?.slug}
                placeholder="collection-slug"
                required
              />
              {state?.errors?.slug && (
                <p className="text-sm text-destructive">
                  {state.errors.slug[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={collection?.description || ""}
              placeholder="Enter collection description"
              rows={3}
            />
            {state?.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select name="type" defaultValue={collection?.type || "STATIC"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STATIC">Static</SelectItem>
                  <SelectItem value="DYNAMIC">Dynamic</SelectItem>
                  <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.type && (
                <p className="text-sm text-destructive">
                  {state.errors.type[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isActive"
                  name="isActive"
                  defaultChecked={collection?.isActive ?? true}
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Active
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="datetime-local"
                id="startDate"
                name="startDate"
                defaultValue={
                  collection?.startDate?.toISOString().slice(0, 16) || ""
                }
              />
              {state?.errors?.startDate && (
                <p className="text-sm text-destructive">
                  {state.errors.startDate[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="datetime-local"
                id="endDate"
                name="endDate"
                defaultValue={
                  collection?.endDate?.toISOString().slice(0, 16) || ""
                }
              />
              {state?.errors?.endDate && (
                <p className="text-sm text-destructive">
                  {state.errors.endDate[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Products *</Label>
            <Card>
              <CardContent className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() => handleProductSelect(product.id)}
                      />
                      <Label
                        htmlFor={`product-${product.id}`}
                        className="text-sm font-normal flex-1 cursor-pointer">
                        {product.name} - {formatCurrency(product.price)}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {state?.errors?.productIds && (
              <p className="text-sm text-destructive">
                {state.errors.productIds[0]}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Selected: {selectedProductIds.length} products
            </p>
          </div>

          <Button
            variant="outline"
            type="submit"
            disabled={isPending || optimisticState.isSubmitting}
            className="w-full hover:bg-black hover:text-white">
            {isPending || optimisticState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : collection ? (
              "Update Collection"
            ) : (
              "Create Collection"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
