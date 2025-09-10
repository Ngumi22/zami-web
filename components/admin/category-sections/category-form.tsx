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
import {
  Category,
  CategorySpecification,
  CategorySpecificationType,
} from "@prisma/client";

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
    (category?.specifications as CategorySpecification[]) || []
  );
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const generateSlug = debounce((n: string) => {
    if (n && !slugManuallyEdited) {
      setSlug(slugify(n));
    }
  }, 300);

  useEffect(() => {
    generateSlug(name);
    return () => generateSlug.cancel();
  }, [name, generateSlug, slugManuallyEdited]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  };

  const handleAddSpecification = () => {
    const newSpec: CategorySpecification = {
      id: `spec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: "",
      type: "TEXT",
      required: false,
      unit: null,
      options: [],
    };
    setSpecifications([...specifications, newSpec]);
  };

  const handleRemoveSpecification = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  const handleSpecificationChange = (
    index: number,
    field: keyof CategorySpecification,
    value: any
  ) => {
    const newSpecs = [...specifications];
    (newSpecs[index] as any)[field] = value;
    setSpecifications(newSpecs);
  };

  const handleAddOption = (specIndex: number) => {
    const newSpecs = [...specifications];
    if (newSpecs[specIndex].type === "SELECT") {
      newSpecs[specIndex].options = [
        ...(newSpecs[specIndex].options || []),
        "",
      ];
      setSpecifications(newSpecs);
    }
  };

  const handleUpdateOption = (
    specIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newSpecs = [...specifications];
    if (newSpecs[specIndex].options) {
      newSpecs[specIndex].options![optionIndex] = value;
      setSpecifications(newSpecs);
    }
  };

  const handleRemoveOption = (specIndex: number, optionIndex: number) => {
    const newSpecs = [...specifications];
    if (newSpecs[specIndex].options) {
      newSpecs[specIndex].options = newSpecs[specIndex].options!.filter(
        (_, i) => i !== optionIndex
      );
      setSpecifications(newSpecs);
    }
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const savingToast = toast({
        title: isEditing ? "Updating category..." : "Creating category...",
        description: "Please wait while we save your changes.",
        duration: 2000,
      });

      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("description", description);
      formData.set("parentId", parentId);
      formData.set("isActive", isActive.toString());
      formData.set("specifications", JSON.stringify(specifications));

      let imageToUse = existingImage;
      if (newImages.length > 0) {
        imageToUse = newImages[0] || existingImage;
      }
      formData.set("image", imageToUse);

      const action = isEditing ? updateCategory : createCategory;
      const result = isEditing
        ? await action(category!.id, formData)
        : await action(formData);

      if (!result.success) {
        setErrors(result.errors || {});
        savingToast.dismiss();
        toast({
          title: "Error saving category ❌",
          description: result.message || "Please check the form and try again.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        savingToast.dismiss();
        toast({
          title: isEditing ? "Category updated ✅" : "Category created 🎉",
          description:
            result.message || "Your changes have been saved successfully.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/categories")}>
              View all
            </Button>
          ),
          duration: 4000,
        });
        router.push("/admin/categories");
        router.refresh();
      }
    });
  }

  const availableParentCategories = allCategories.filter((cat) => {
    if (!isEditing) return true;
    if (cat.id === category?.id) return false;

    const isDescendant = (
      ancestorId: string,
      targetCategory: CategoryWithChildren
    ): boolean => {
      if (!targetCategory.children) return false;
      return targetCategory.children.some(
        (child) =>
          child.id === ancestorId ||
          isDescendant(ancestorId, child as CategoryWithChildren)
      );
    };

    return !isDescendant(category!.id, cat);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold tracking-tight mx-auto">
          {isEditing ? "Edit Category" : "New Category"}
        </h1>
      </div>

      <form action={handleSubmit} className="space-y-8">
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
                  name="name"
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
                  onChange={handleSlugChange}
                  className={errors.slug ? "border-destructive" : ""}
                  required
                  name="slug"
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
              <Label htmlFor="description">Category Description</Label>
              <Textarea
                id="description"
                value={description}
                placeholder="Brief description of the category"
                onChange={(e) => setDescription(e.target.value)}
                name="description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(val) => setParentId(val === "none" ? "" : val)}
                name="parentId">
                <SelectTrigger>
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {availableParentCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
                name="isActive"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </CardContent>
        </Card>

        {!parentId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Uploader
                  imageUrls={newImages}
                  {...mainImageUploader}
                  endpoint="imageUploader"
                />
                {existingImage && (
                  <div className="relative w-40 h-40 rounded-md overflow-hidden">
                    <Image
                      src={existingImage}
                      alt="Category image preview"
                      layout="fill"
                      objectFit="cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => setExistingImage("")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Specifications</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSpecification}>
                  <Plus className="h-4 w-4 mr-2" /> Add Specification
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {specifications.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No specifications defined for this category.
                  </p>
                )}
                {specifications.map((spec, index) => (
                  <div
                    key={spec.id}
                    className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        Specification #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpecification(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`spec-name-${index}`}>Name</Label>
                        <Input
                          id={`spec-name-${index}`}
                          value={spec.name}
                          onChange={(e) =>
                            handleSpecificationChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Screen Size"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`spec-unit-${index}`}>Unit</Label>
                        <Input
                          id={`spec-unit-${index}`}
                          value={spec.unit || ""}
                          onChange={(e) =>
                            handleSpecificationChange(
                              index,
                              "unit",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Inches"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`spec-type-${index}`}>Type</Label>
                      <Select
                        value={spec.type}
                        onValueChange={(value: CategorySpecificationType) =>
                          handleSpecificationChange(index, "type", value)
                        }>
                        <SelectTrigger id={`spec-type-${index}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="NUMBER">Number</SelectItem>
                          <SelectItem value="BOOLEAN">Boolean</SelectItem>
                          <SelectItem value="SELECT">Select</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {spec.type === "SELECT" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddOption(index)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Option
                          </Button>
                        </div>
                        {spec.options && spec.options.length > 0 ? (
                          <div className="space-y-2">
                            {spec.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex gap-2 items-center">
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      index,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option value"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveOption(index, optionIndex)
                                  }>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Add at least one option for this type.
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`spec-required-${index}`}
                        checked={spec.required}
                        onCheckedChange={(checked) =>
                          handleSpecificationChange(
                            index,
                            "required",
                            !!checked
                          )
                        }
                      />
                      <Label htmlFor={`spec-required-${index}`}>Required</Label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
