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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Uploader, { useUploader } from "../forms/imageUploader";
import { createBrand, updateBrand } from "@/lib/brand-actions";
import { Brand } from "@prisma/client";

interface BrandFormProps {
  brand?: Brand;
}

export default function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!brand;

  // Form state
  const [name, setName] = useState(brand?.name || "");
  const [slug, setSlug] = useState(brand?.slug || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [existingLogo, setExistingLogo] = useState(brand?.logo || "");
  const { imageUrls: newLogos, ...logoUploader } = useUploader({
    maxFiles: 1,
    initialValue: [],
  });
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);

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

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        // Clear previous errors
        setErrors({});

        // Prepare form data
        formData.set("name", name);
        formData.set("slug", slug);
        formData.set("description", description);

        // Use existing logo if present, otherwise use new uploaded logo
        const logoToUse = existingLogo || newLogos[0] || "";
        formData.set("logo", logoToUse);

        formData.set("isActive", isActive.toString());

        const result = isEditing
          ? await updateBrand(brand.id, formData)
          : await createBrand(formData);

        if (result.success) {
          toast({
            title: isEditing ? "Brand updated" : "Brand created",
            description: result.message,
          });
          router.push("/admin/brands");
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
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Brand" : "Create Brand"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  placeholder="Enter brand name"
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
                  placeholder="brand-slug"
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
                placeholder="Enter brand description"
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
                <Label>Brand Logo</Label>
                {existingLogo && isEditing ? (
                  <Card className="relative overflow-hidden">
                    <div className="relative aspect-square w-full rounded-md overflow-hidden">
                      <Image
                        src={existingLogo || "/placeholder.svg"}
                        alt="Brand logo"
                        fill
                        className="object-contain bg-white p-4"
                        sizes="(max-width: 500px) 100vw, 300px"
                      />
                      <button
                        type="button"
                        onClick={() => setExistingLogo("")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
                        aria-label="Remove existing logo">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3 bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Current brand logo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the × to replace with a new logo
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Uploader
                    imageUrls={newLogos}
                    {...logoUploader}
                    endpoint="imageUploader"
                  />
                )}
                {errors.logo && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.logo[0]}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex items-start pt-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) =>
                      setIsActive(checked as boolean)
                    }
                  />
                  <Label htmlFor="isActive">Active brand</Label>
                </div>
              </div>
            </div>
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
              ? "Update Brand"
              : "Create Brand"}
          </Button>
        </div>
      </form>
    </div>
  );
}
