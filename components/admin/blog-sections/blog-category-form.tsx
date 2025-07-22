"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import { createBlogCategoryAction } from "@/lib/blog-actions";

export function CreateBlogCategoryForm() {
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name") {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("description", form.description);

    setLoading(true);
    const result = await createBlogCategoryAction(fd);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Created",
        description: "Blog category added successfully",
      });
      setForm({ name: "", slug: "", description: "" });
      setErrors({});
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to create",
        variant: "destructive",
      });
      if (result.errors) setErrors(result.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name[0]}</p>
        )}
      </div>

      <div>
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
          required
        />
        {errors.slug && (
          <p className="text-sm text-red-500">{errors.slug[0]}</p>
        )}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}
