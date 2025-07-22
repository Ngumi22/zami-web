"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Save,
  Eye,
  Globe,
  Tag,
  Plus,
  X,
  Sparkles,
  FileText,
  Settings,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import RichTextEditor from "../forms/products/Editor";
import Uploader from "../forms/imageUploader";
import { useUploader } from "../forms/imageUploader";
import { cn, slugify } from "@/lib/utils";

import { BlogActionState } from "@/lib/blog-schema";
import { BlogCategory, BlogPost, BlogPostStatus, User } from "@prisma/client";
import {
  createBlogPostAction,
  saveDraftAction,
  updateBlogPostAction,
} from "@/lib/blog-actions";
import { debounce } from "lodash";

interface BlogPostFormProps {
  post?: BlogPost;
  mode: "create" | "edit";
  authors: User[];
  categories: BlogCategory[];
}

export default function BlogPostForm({
  post,
  mode,
  authors,
  categories: initialCategories,
}: BlogPostFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [author, setAuthor] = useState(post?.authorId ?? "");
  const [categories, setCategories] =
    useState<BlogCategory[]>(initialCategories);
  const [category, setCategory] = useState(post?.categoryId ?? "");
  const [status, setStatus] = useState<BlogPostStatus>(
    post?.status ?? BlogPostStatus.DRAFT
  );
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [newTag, setNewTag] = useState("");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription ?? ""
  );
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 16)
      : ""
  );

  const { imageUrls: featuredImages, ...uploaderProps } = useUploader({
    maxFiles: 1,
    initialValue: post?.featuredImage ? [post.featuredImage] : [],
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<BlogActionState>({
    success: undefined,
    message: "",
    errors: {},
  });

  // debounced slug from title
  const updateSlug = useCallback(
    debounce((t: string) => setSlug(slugify(t)), 300),
    []
  );
  useEffect(() => {
    if (!post) updateSlug(title);
    return () => updateSlug.cancel();
  }, [title, post, updateSlug]);

  // toast + redirect
  useEffect(() => {
    if (state.success === true) {
      toast({ title: "Success", description: state.message });
      router.push(
        state.data?.slug ? `/admin/blog/${state.data.slug}` : "/admin/blog"
      );
    } else if (state.success === false && state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, router]);

  // auto-save draft handler
  useEffect(() => {
    if (mode === "edit" && post && (title || content)) {
      const t = setTimeout(async () => {
        setIsAutoSaving(true);
        const fd = new FormData();
        fd.set("title", title);
        fd.set("content", content);
        try {
          await saveDraftAction(post.id, fd);
          setLastSaved(new Date());
        } catch (e) {
          console.error("Auto-save failed", e);
        } finally {
          setIsAutoSaving(false);
        }
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [mode, post, title, content]);

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setNewTag("");
    }
  };
  const removeTag = (t: string) => setTags(tags.filter((t2) => t2 !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const fd = new FormData(e.currentTarget as HTMLFormElement);
    // ensure all form data values
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("excerpt", excerpt);
    fd.set("content", content);
    fd.set("authorId", author);
    fd.set("categoryId", category);
    fd.set("status", status);
    fd.set("featuredImage", featuredImages[0] || "");
    fd.set("tags", JSON.stringify(tags));
    fd.set("metaTitle", metaTitle);
    fd.set("metaDescription", metaDescription);
    fd.set("featured", String(featured));
    fd.set(
      "publishedAt",
      publishedAt ? new Date(publishedAt).toISOString() : ""
    );

    try {
      const result =
        mode === "edit" && post
          ? await updateBlogPostAction(post.id, state, fd)
          : await createBlogPostAction(state, fd);
      setState(result);
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsPending(false);
  };

  const handleSaveDraft = () => setStatus(BlogPostStatus.DRAFT);
  const handlePublish = () => {
    setStatus(BlogPostStatus.PUBLISHED);
    if (!publishedAt) setPublishedAt(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          {mode === "edit" ? "Edit Blog Post" : "Create Blog Post"}
        </h1>
        <Button
          variant="outline"
          onClick={() =>
            toast({ title: "Preview", description: "Preview here" })
          }>
          <Eye className="w-4 h-4 mr-2" /> Preview
        </Button>
      </div>
      {state.success === false && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Tabs */}
        <Tabs defaultValue="content">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="content">
              <FileText className="w-4 h-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="w-4 h-4" /> SEO & Meta
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    {state.errors?.title && (
                      <p className="text-sm text-red-500">
                        {state.errors.title[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                    {state.errors?.slug && (
                      <p className="text-sm text-red-500">
                        {state.errors.slug[0]}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Excerpt *</Label>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                    required
                  />
                  {state.errors?.excerpt && (
                    <p className="text-sm text-red-500">
                      {state.errors.excerpt[0]}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor value={content} onChange={setContent} />
                {state.errors?.content && (
                  <p className="text-sm text-red-500">
                    {state.errors.content[0]}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Uploader
                  {...uploaderProps}
                  imageUrls={featuredImages}
                  endpoint="imageUploader"
                />
                {state.errors?.featuredImage && (
                  <p className="text-sm text-red-500">
                    {state.errors.featuredImage[0]}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Publishing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Author *</Label>
                    <Select value={author} onValueChange={setAuthor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {state.errors?.authorId && (
                      <p className="text-sm text-red-500">
                        {state.errors.authorId[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {state.errors?.categoryId && (
                      <p className="text-sm text-red-500">
                        {state.errors.categoryId[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as BlogPostStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.values(BlogPostStatus) as string[]).map(
                          (s) => (
                            <SelectItem key={s} value={s}>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    s === "DRAFT"
                                      ? "bg-gray-400"
                                      : "bg-green-500"
                                  )}
                                />
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {status === BlogPostStatus.PUBLISHED && (
                    <div>
                      <Label>Publish Date</Label>
                      <Input
                        type="datetime-local"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={featured}
                    onCheckedChange={setFeatured}
                    id="featured"
                  />
                  <Label htmlFor="featured" className="flex items-center gap-2">
                    <Sparkles /> Featured Post
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Tag /> Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onKeyDown={(e) =>
                      e.key === "Enter"
                        ? (e.preventDefault(), addTag())
                        : undefined
                    }
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim()}>
                    <Plus />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Badge key={t} className="flex items-center gap-1">
                        {t}{" "}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(t)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {state.errors?.tags && (
                  <p className="text-sm text-red-500">{state.errors.tags[0]}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  {state.errors?.metaTitle && (
                    <p className="text-sm text-red-500">
                      {state.errors.metaTitle[0]}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                  />
                  {state.errors?.metaDescription && (
                    <p className="text-sm text-red-500">
                      {state.errors.metaDescription[0]}
                    </p>
                  )}
                </div>
                <div className="p-4 border bg-gray-50">
                  <h4 className="font-medium mb-2">Search Preview</h4>
                  <div className="text-blue-600 text-lg">
                    {metaTitle || title}
                  </div>
                  <div className="text-gray-600">/{slug}</div>
                  <div className="text-gray-700">
                    {metaDescription || excerpt}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <Separator />
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            disabled={isPending || !title || !content || !author || !category}
            onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="submit"
            disabled={isPending || !title || !content || !author || !category}
            onClick={handlePublish}>
            <Globe className="w-4 h-4 mr-2" />
            {isPending
              ? mode === "edit"
                ? "Updating..."
                : "Publishing..."
              : mode === "edit"
              ? "Update & Publish"
              : "Publish Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
