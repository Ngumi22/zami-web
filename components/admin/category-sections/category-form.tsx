"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import slugify from "react-slugify";
import { debounce } from "lodash";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Uploader, { useUploader } from "../forms/imageUploader";
import Image from "next/image";
import { createCategory, updateCategory } from "@/lib/category-actions";
import { Category, CategorySpecification } from "@prisma/client";

interface CategoryWithChildren extends Category {
  children?: Category[];
}

interface CategoryFormProps {
  category?: CategoryWithChildren;
  allCategories?: CategoryWithChildren[];
  parentCategory?: CategoryWithChildren;
}

export default function CategoryForm({
  category,
  allCategories = [],
  parentCategory,
}: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!category;

  // Form state
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [parentId, setParentId] = useState(
    category?.parentId || parentCategory?.id || ""
  );
  const [existingImage, setExistingImage] = useState(category?.image || "");
  const { imageUrls: newImages, ...mainImageUploader } = useUploader({
    maxFiles: 1,
    initialValue: [],
  });
  const [specifications, setSpecifications] = useState<CategorySpecification[]>(
    category?.specifications || []
  );
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  // Error state
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Auto-generate slug from name
  const generateSlug = debounce((n: string) => {
    if (n && !isEditing) {
      setSlug(slugify(n));
    }
  }, 300);

  useEffect(() => {
    generateSlug(name);
    return () => generateSlug.cancel();
  }, [name, generateSlug]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.name && name) {
      setErrors((prev) => ({ ...prev, name: [] }));
    }
  }, [name, errors.name]);

  useEffect(() => {
    if (errors.slug && slug) {
      setErrors((prev) => ({ ...prev, slug: [] }));
    }
  }, [slug, errors.slug]);

  const addSpecification = () => {
    const newSpec: CategorySpecification = {
      id: `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      type: "TEXT",
      required: false,
      options: [],
      unit: null,
    };
    setSpecifications([...specifications, newSpec]);
  };

  const updateSpecification = (
    index: number,
    field: keyof CategorySpecification,
    value: any
  ) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "type" && value !== "SELECT") {
      updated[index].options = [];
    }

    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const addOption = (specIndex: number) => {
    const updated = [...specifications];
    if (!updated[specIndex].options) {
      updated[specIndex].options = [];
    }
    updated[specIndex].options!.push("");
    setSpecifications(updated);
  };

  const updateOption = (
    specIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...specifications];
    updated[specIndex].options![optionIndex] = value;
    setSpecifications(updated);
  };

  const removeOption = (specIndex: number, optionIndex: number) => {
    const updated = [...specifications];
    updated[specIndex].options = updated[specIndex].options!.filter(
      (_, i) => i !== optionIndex
    );
    setSpecifications(updated);
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        // Clear previous errors
        setErrors({});

        // Prepare form data
        formData.set("name", name);
        formData.set("slug", slug);
        formData.set("description", description);
        formData.set("parentId", parentId);

        // Use existing image if present, otherwise use new uploaded image
        const imageToUse = existingImage || newImages[0] || "";
        formData.set("image", imageToUse);

        const specsWithIds = specifications.map((spec) => ({
          ...spec,
          id:
            spec.id ||
            `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));

        formData.set("specifications", JSON.stringify(specsWithIds));
        formData.set("isActive", isActive.toString());

        const result = isEditing
          ? await updateCategory(category.id, formData)
          : await createCategory(formData);

        if (result.success) {
          toast({
            title: isEditing ? "Category updated" : "Category created",
            description: result.message,
          });
          router.push("/admin/categories");
          router.refresh();
        } else {
          if (result.errors) {
            console.log("Validation errors:", result.errors);
            setErrors(result.errors);
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
    });
  }

  // Filter out current category and its descendants from parent options
  const availableParentCategories = allCategories.filter((cat) => {
    if (!isEditing) return true;
    if (cat.id === category?.id) return false;

    // Check if cat is a descendant of current category
    const isDescendant = (
      parent: CategoryWithChildren,
      targetId: string
    ): boolean => {
      if (!parent.children) return false;
      return parent.children.some(
        (child: Category) =>
          child.id === targetId || isDescendant(child, targetId)
      );
    };

    return !isDescendant(category!, cat.id);
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 px-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        {parentCategory && (
          <span>
            Creating subcategory for: <strong>{parentCategory.name}</strong>
          </span>
        )}
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  placeholder="Enter category name"
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                  required
                />
                {errors.name && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.name[0]}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  placeholder="category-slug"
                  onChange={(e) => setSlug(e.target.value)}
                  className={errors.slug ? "border-destructive" : ""}
                  required
                />
                {errors.slug && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.slug[0]}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                placeholder="Enter category description"
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.description[0]}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Category Image</Label>
                {existingImage && isEditing ? (
                  <Card className="relative overflow-hidden">
                    <div className="relative aspect-square w-full rounded-md overflow-hidden">
                      <Image
                        src={existingImage || "/placeholder.svg"}
                        alt="Category image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 500px) 100vw, 300px"
                      />
                      <button
                        type="button"
                        onClick={() => setExistingImage("")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
                        aria-label="Remove existing image">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3 bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Current category image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the × to replace with a new image
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Uploader
                    imageUrls={newImages}
                    {...mainImageUploader}
                    endpoint="imageUploader"
                  />
                )}
                {errors.image && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.image[0]}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={parentId || "none"}
                  onValueChange={(val) =>
                    setParentId(val === "none" ? "" : val)
                  }>
                  <SelectTrigger
                    className={errors.parentId ? "border-destructive" : ""}>
                    <SelectValue placeholder="None (root category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      — None (Root Category) —
                    </SelectItem>
                    {availableParentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentId && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.parentId[0]}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="isActive">Active category</Label>
            </div>
          </CardContent>
        </Card>

        {/* Category Specifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Category Specifications</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecification}>
                <Plus className="w-4 h-4 mr-2" />
                Add Specification
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {specifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No specifications defined yet</p>
                <p className="text-sm">
                  Add specifications to help users filter and compare products
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {specifications.map((spec, index) => (
                  <div
                    key={spec.id}
                    className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Specification {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecification(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., Display Size"
                          value={spec.name}
                          onChange={(e) =>
                            updateSpecification(index, "name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>
                          Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={spec.type}
                          onValueChange={(value) =>
                            updateSpecification(index, "type", value)
                          }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEXT">Text</SelectItem>
                            <SelectItem value="NUMBER">Number</SelectItem>
                            <SelectItem value="SELECT">Select</SelectItem>
                            <SelectItem value="BOOLEAN">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input
                          placeholder="e.g., inches, GB"
                          value={spec.unit || ""}
                          onChange={(e) =>
                            updateSpecification(index, "unit", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={spec.required}
                        onCheckedChange={(checked) =>
                          updateSpecification(index, "required", checked)
                        }
                      />
                      <Label>Required field</Label>
                    </div>

                    {spec.type === "SELECT" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(index)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {spec.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                placeholder="Option value"
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    index,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  removeOption(index, optionIndex)
                                }>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          {(!spec.options || spec.options.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              Add at least one option for select type
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.specifications && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.specifications[0]}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Category"
              : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
