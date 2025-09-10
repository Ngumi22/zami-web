"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import slugify from "react-slugify";
import {
  productFormSchema,
  type ProductFormData,
  type ProductVariant,
} from "@/lib/schema";
import { createProduct, updateProduct } from "@/lib/product-actions";
import { Brand, Category, Product } from "@prisma/client";
import Uploader, { useUploader } from "../imageUploader";
import RichTextEditor from "./Editor";
import ArrayInput from "../array-input";

export interface EnhancedCategory extends Category {
  parent?: Category | null;
  parentSpecifications: any[];
}

export interface ProductFormProps {
  product?: Product;
  categories: EnhancedCategory[];
  brands: Brand[];
}
export default function ProductForm({
  product,
  categories,
  brands,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const isEditing = !!product;

  // Memoized category map for fast lookups
  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.id, cat]));
  }, [categories]);

  // Get parent specifications for a category
  const getParentSpecifications = useCallback(
    (categoryId: string) => {
      const category = categoryMap.get(categoryId);
      return category?.parentSpecifications || [];
    },
    [categoryMap]
  );

  // Initialize form with optimized default values
  const defaultValues = useMemo(() => {
    const initialSpecs: Record<string, string> = {};

    if (product?.specifications && typeof product.specifications === "object") {
      const productSpecs = product.specifications as Record<string, string>;

      // For editing: Convert stored specification names back to IDs for form
      if (product.categoryId) {
        const parentSpecs = getParentSpecifications(product.categoryId);
        for (const [name, value] of Object.entries(productSpecs)) {
          const spec = parentSpecs.find((s: any) => s.name === name);
          if (spec) {
            initialSpecs[spec.id] = value;
          }
        }
      }
    }

    return {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice ?? null,
      stock: product?.stock ?? 0,
      featured: product?.featured ?? false,
      mainImage: product?.mainImage ?? "",
      thumbnailImages: product?.thumbnailImages ?? [],
      specifications: initialSpecs,
      variants:
        product?.variants?.map((v) => ({
          ...v,
          sku: v.sku ?? "",
        })) ?? [],
      tags: product?.tags ?? [],
    };
  }, [product, getParentSpecifications]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const { watch, setValue, getValues, clearErrors, formState } = form;
  const watchedName = watch("name");
  const watchedCategoryId = watch("categoryId");

  // Get current category's parent specifications
  const currentParentSpecifications = useMemo(() => {
    return watchedCategoryId ? getParentSpecifications(watchedCategoryId) : [];
  }, [watchedCategoryId, getParentSpecifications]);

  // Handle name change with debounced slug generation
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setValue("name", newName);

      if (newName && !isEditing) {
        const newSlug = slugify(newName);
        setValue("slug", newSlug);
      }
    },
    [setValue, isEditing]
  );

  // Handle category change
  const handleCategoryChange = useCallback(
    (value: string) => {
      setValue("categoryId", value);

      if (!isEditing) {
        // Reset specifications for new category
        const parentSpecs = getParentSpecifications(value);
        const newSpecs: Record<string, string> = {};
        parentSpecs.forEach((spec: any) => {
          newSpecs[spec.id] = "";
        });
        setValue("specifications", newSpecs);
      }
    },
    [setValue, getParentSpecifications, isEditing]
  );
  // components/admin/forms/products/form.tsx

  // Remove the onChange handlers from the useUploader hooks
  const { imageUrls: mainImageUrls, ...mainImageUploader } = useUploader({
    initialValue: product?.mainImage ? [product.mainImage] : [],
    maxFiles: 1,
  });

  const { imageUrls: thumbnailUrls, ...thumbnailUploader } = useUploader({
    initialValue: product?.thumbnailImages || [],
    maxFiles: 4,
  });

  useEffect(() => {
    if (mainImageUrls.length > 0) {
      setValue("mainImage", mainImageUrls[0]);
      clearErrors("mainImage");
    } else if (!isEditing) {
      setValue("mainImage", "");
    }
  }, [mainImageUrls, setValue, clearErrors, isEditing]);

  useEffect(() => {
    setValue("thumbnailImages", thumbnailUrls);
    clearErrors("thumbnailImages");
  }, [thumbnailUrls, setValue, clearErrors]);
  // Variant management
  const addVariant = useCallback(() => {
    const currentVariants = getValues("variants");
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: "",
      type: "",
      value: "",
      priceModifier: 0,
      stock: 0,
      sku: "",
    };
    setValue("variants", [...currentVariants, newVariant]);
  }, [getValues, setValue]);

  const removeVariant = useCallback(
    (index: number) => {
      const currentVariants = getValues("variants");
      setValue(
        "variants",
        currentVariants.filter((_, i) => i !== index)
      );
    },
    [getValues, setValue]
  );

  const updateVariant = useCallback(
    (index: number, field: keyof ProductVariant, value: string | number) => {
      const currentVariants = getValues("variants");
      const updatedVariants = [...currentVariants];
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      setValue("variants", updatedVariants);
    },
    [getValues, setValue]
  );

  // Form submission
  const onSubmit: SubmitHandler<ProductFormData> = useCallback(
    async (data) => {
      try {
        if (!data.mainImage || data.mainImage.trim() === "") {
          form.setError("mainImage", {
            type: "required",
            message: "Please upload a main image.",
          });
          toast({
            title: "Validation Error",
            description: "Please upload a main image before submitting.",
            variant: "destructive",
          });
          return;
        }

        let result;
        if (isEditing) {
          result = await updateProduct(product.id, data);
        } else {
          result = await createProduct(data);
        }

        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
            variant: "default",
          });
          router.push("/admin/products");
        } else {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(field as any, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }

          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    },
    [isEditing, product?.id, form, toast, router]
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Header and buttons */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                size="sm"
                disabled={formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={formState.isSubmitting} size="sm">
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Basic Info, Pricing, Tags */}
            <div className="space-y-4">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Product Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={handleNameChange}
                            placeholder="Enter product name"
                            className="h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">SEO Slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="h-8 bg-muted cursor-not-allowed"
                            placeholder="Auto-generated from name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Short Description *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description"
                            rows={2}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Category *</FormLabel>
                          <Select
                            onValueChange={handleCategoryChange}
                            value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Brand *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Inventory */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Price *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8"
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Original</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number.parseFloat(e.target.value)
                                    : null
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Stock *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="0"
                              className="h-8"
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            Featured Product
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ArrayInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Add tag (e.g., electronics, gaming)"
                            maxItems={20}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Description & Specifications */}
            <div className="space-y-4">
              {/* Description */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Description *</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            error={!!form.formState.errors.description}
                            className="min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Dynamic Specifications */}
              {currentParentSpecifications.length > 0 && (
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentParentSpecifications.map((spec: any) => (
                      <FormField
                        key={spec.id}
                        control={form.control}
                        name={`specifications.${spec.id}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">
                              {spec.name} {spec.required && "*"}
                              {spec.unit && `(${spec.unit})`}
                            </FormLabel>
                            <FormControl>
                              {spec.type === "SELECT" ? (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ""}>
                                  <SelectTrigger className="h-8">
                                    <SelectValue
                                      placeholder={`Select ${spec.name.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {spec.options?.map((option: string) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : spec.type === "BOOLEAN" ? (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox
                                    checked={field.value === "true"}
                                    onCheckedChange={(checked) =>
                                      field.onChange(checked ? "true" : "false")
                                    }
                                  />
                                  <Label className="text-sm">Yes</Label>
                                </div>
                              ) : (
                                <Input
                                  {...field}
                                  type={
                                    spec.type === "NUMBER" ? "number" : "text"
                                  }
                                  placeholder={`Enter ${spec.name.toLowerCase()}`}
                                  className="h-8"
                                  value={field.value ?? ""}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Images & Variants */}
            <div className="space-y-4">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="mainImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Main Image *</FormLabel>
                        <FormControl>
                          <div>
                            <Uploader
                              imageUrls={mainImageUrls}
                              {...mainImageUploader}
                              endpoint="imageUploader"
                            />
                            {mainImageUrls.length === 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Please upload a main image for your product
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label className="text-sm">Thumbnails (Max 4)</Label>
                    <Uploader
                      imageUrls={thumbnailUrls}
                      {...thumbnailUploader}
                      endpoint="imageUploader"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {thumbnailUrls.length} thumbnail
                      {thumbnailUrls.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Variants</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {watch("variants").length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No variants added
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {watch("variants").map((variant, index) => (
                        <div
                          key={variant.id}
                          className="border rounded-lg p-3 relative">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <div className="grid grid-cols-2 gap-2 pr-8">
                            <div>
                              <Label className="text-xs">Name *</Label>
                              <Input
                                placeholder="Color"
                                value={variant.name}
                                onChange={(e) =>
                                  updateVariant(index, "name", e.target.value)
                                }
                                className="h-7 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Type *</Label>
                              <Input
                                placeholder="color"
                                value={variant.type}
                                onChange={(e) =>
                                  updateVariant(index, "type", e.target.value)
                                }
                                className="h-7 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Value *</Label>
                              <Input
                                placeholder="Red"
                                value={variant.value}
                                onChange={(e) =>
                                  updateVariant(index, "value", e.target.value)
                                }
                                className="h-7 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Price +/-</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.priceModifier}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "priceModifier",
                                    Number.parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-7 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Stock *</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variant.stock}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "stock",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-7 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">SKU</Label>
                              <Input
                                placeholder="SKU"
                                value={variant.sku || ""}
                                onChange={(e) =>
                                  updateVariant(index, "sku", e.target.value)
                                }
                                className="h-7 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
