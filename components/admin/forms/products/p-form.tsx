"use client";

import type React from "react";

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
import type { Brand, Category, Product } from "@prisma/client";
import Uploader, { useUploader } from "../imageUploader";
import RichTextEditor from "./Editor";
import ArrayInput from "../array-input";
import { Loader2, Plus, Trash2 } from "lucide-react";

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

  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.id, cat]));
  }, [categories]);

  const getParentSpecifications = useCallback(
    (categoryId: string) => {
      const category = categoryMap.get(categoryId);
      return category?.parentSpecifications || [];
    },
    [categoryMap]
  );

  const defaultValues = useMemo(() => {
    const initialSpecs: Record<string, string> = {};

    if (product?.specifications && typeof product.specifications === "object") {
      const productSpecs = product.specifications as Record<string, string>;

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

  const currentParentSpecifications = useMemo(() => {
    return watchedCategoryId ? getParentSpecifications(watchedCategoryId) : [];
  }, [watchedCategoryId, getParentSpecifications]);

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

  const handleCategoryChange = useCallback(
    (value: string) => {
      setValue("categoryId", value);

      if (!isEditing) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                  {isEditing ? "Edit Product" : "Create New Product"}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {isEditing
                    ? "Update product information and settings"
                    : "Add a new product to your catalog"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={formState.isSubmitting}
                className="px-6">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formState.isSubmitting}
                className="px-3 bg-black text-white"
                form="product-form">
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-2">
        <Form {...form}>
          <form
            id="product-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
              <div className="xl:col-span-4 space-y-3">
                <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Basic Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleNameChange}
                              placeholder="Enter product name"
                              className="h-10 border-slate-300 dark:border-slate-600 focus:border-black dark:focus:border-black"
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
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            SEO Slug
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-not-allowed"
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
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Short Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Brief description for product listings"
                              rows={3}
                              className="border-slate-300 dark:border-slate-600 focus:border-black dark:focus:border-black resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Category
                            </FormLabel>
                            <Select
                              onValueChange={handleCategoryChange}
                              value={field.value ?? ""}>
                              <FormControl>
                                <SelectTrigger className="h-10 border-slate-300 dark:border-slate-600">
                                  <SelectValue placeholder="Select category" />
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
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Brand
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}>
                              <FormControl>
                                <SelectTrigger className="h-10 border-slate-300 dark:border-slate-600">
                                  <SelectValue placeholder="Select brand" />
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

                <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Pricing & Inventory
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Price
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="100"
                                min="0"
                                placeholder="0"
                                className="h-10 border-slate-300 dark:border-slate-600"
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
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Original
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="100"
                                min="0"
                                placeholder="0"
                                className="h-10 border-slate-300 dark:border-slate-600"
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
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Stock
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="0"
                                className="h-10 border-slate-300 dark:border-slate-600"
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-slate-400 dark:border-slate-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Featured Product
                            </FormLabel>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Display this product prominently on your store
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Tags
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
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

              <div className="xl:col-span-4 space-y-3">
                <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Description
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
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
                              className="min-h-[300px] border-slate-300 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {currentParentSpecifications.length > 0 && (
                  <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">
                          Specifications
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                      {currentParentSpecifications.map((spec: any) => (
                        <FormField
                          key={spec.id}
                          control={form.control}
                          name={`specifications.${spec.id}` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {spec.name} {spec.required && ""}
                                {spec.unit && ` (${spec.unit})`}
                              </FormLabel>
                              <FormControl>
                                {spec.type === "SELECT" ? (
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}>
                                    <SelectTrigger className="h-10 border-slate-300 dark:border-slate-600">
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
                                        field.onChange(
                                          checked ? "true" : "false"
                                        )
                                      }
                                      className="border-slate-400 dark:border-slate-500"
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
                                    className="h-10 border-slate-300 dark:border-slate-600"
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

              <div className="xl:col-span-4 space-y-3">
                <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Images
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <FormField
                      control={form.control}
                      name="mainImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Main Image
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <Uploader
                                imageUrls={mainImageUrls}
                                {...mainImageUploader}
                                endpoint="imageUploader"
                              />
                              {mainImageUrls.length === 0 && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
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
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Thumbnails (Max 4)
                      </Label>
                      <div className="mt-2">
                        <Uploader
                          imageUrls={thumbnailUrls}
                          {...thumbnailUploader}
                          endpoint="imageUploader"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          {thumbnailUrls.length} thumbnail
                          {thumbnailUrls.length !== 1 ? "s" : ""} selected
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">
                          Variants
                        </CardTitle>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                        className="border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/20 bg-transparent">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Variant
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {watch("variants").length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-sm">No variants added</p>
                        <p className="text-xs mt-1">
                          Add variants like size, color, or style
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {watch("variants").map((variant, index) => (
                          <div
                            key={variant.id}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 relative bg-slate-50 dark:bg-slate-800/50">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="absolute top-2 right-2 h-7 w-7 p-0 bg-red-500 text-white hover:bg-red-600 border-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <div className="grid grid-cols-2 gap-3 pr-10">
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Name
                                </Label>
                                <Input
                                  placeholder="Color"
                                  value={variant.name}
                                  onChange={(e) =>
                                    updateVariant(index, "name", e.target.value)
                                  }
                                  className="h-8 text-sm mt-1 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Type
                                </Label>
                                <Input
                                  placeholder="color"
                                  value={variant.type}
                                  onChange={(e) =>
                                    updateVariant(index, "type", e.target.value)
                                  }
                                  className="h-8 text-sm mt-1 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Value
                                </Label>
                                <Input
                                  placeholder="Red"
                                  value={variant.value}
                                  onChange={(e) =>
                                    updateVariant(
                                      index,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-sm mt-1 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Price +/-
                                </Label>
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
                                  className="h-8 text-sm mt-1 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  Stock
                                </Label>
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
                                  className="h-8 text-sm mt-1 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  SKU
                                </Label>
                                <Input
                                  placeholder="SKU"
                                  value={variant.sku || ""}
                                  onChange={(e) =>
                                    updateVariant(index, "sku", e.target.value)
                                  }
                                  className="h-8 text-sm mt-1 border-slate-300 dark:border-slate-600"
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
    </div>
  );
}
