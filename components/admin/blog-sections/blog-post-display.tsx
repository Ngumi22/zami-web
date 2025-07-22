"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, ArrowLeft, Eye, Calendar, User, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteBlogPost } from "@/lib/blog-actions";
import { BlogPostWithAuthor } from "@/lib/types";

interface BlogPostDisplayProps {
  post: BlogPostWithAuthor;
}

export function BlogPostDisplay({ post }: BlogPostDisplayProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteBlogPost(post.id);
      if (result.success) {
        toast({
          title: "Blog post deleted",
          description: result.message,
        });
        router.push("/admin/blog");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            <p className="text-muted-foreground">Blog Post Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/blog/${post.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Post Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Post Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    post.status === "published" ? "default" : "secondary"
                  }>
                  {post.status}
                </Badge>
                <Badge variant="outline">{post.category}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Author: {post.author.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created: {post.createdAt.toISOString().split("T")[0]}
                  </span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Published: {post.publishedAt.toISOString().split("T")[0]}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">SEO Slug:</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {post.slug}
                </code>
              </div>
            </div>

            <div className="space-y-4">
              {post.featuredImage && (
                <div>
                  <p className="text-sm font-medium mb-2">Featured Image:</p>
                  <img
                    src={post.featuredImage || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=128&width=256";
                    }}
                  />
                </div>
              )}

              {post.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" />
                    <p className="text-sm font-medium">Tags:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <CardTitle>Excerpt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{post.excerpt}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
