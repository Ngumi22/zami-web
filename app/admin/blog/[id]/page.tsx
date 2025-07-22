import { Label } from "@/components/ui/label";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import {
  Edit,
  Calendar,
  User,
  Tag,
  Eye,
  Clock,
  Star,
  Share2,
  Bookmark,
  MessageCircle,
  ArrowLeft,
  Globe,
  Search,
} from "lucide-react";
import { getBlogPost } from "@/data/blog";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/blog/${post.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Post Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                  {post.featured && (
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  {post.views.toLocaleString()} views
                </div>
              </div>

              <CardTitle className="text-3xl font-bold leading-tight">
                {post.title}
              </CardTitle>
              <CardDescription className="text-lg mt-3">
                {post.excerpt}
              </CardDescription>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt={post.authorId} />
                      <AvatarFallback>{post.authorId}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{post.authorId}</p>
                      <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {post.publishedAt
                      ? format(post.publishedAt, "PPP")
                      : format(post.createdAt, "PPP")}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(post.updatedAt, { addSuffix: true })}
                  </div>
                </div>
                <Badge variant="secondary">{post.categoryId}</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Featured Image */}
          {post.featuredImage && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Post Content */}
          <Card>
            <CardContent className="p-6">
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="hover:bg-primary/10 cursor-pointer">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Comments feature coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-medium">
                  {post.views.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(post.status)}>
                  {post.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="secondary">{post.categoryId}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{format(post.createdAt, "PP")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-sm">{format(post.updatedAt, "PP")}</span>
              </div>
              {post.publishedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Published
                  </span>
                  <span className="text-sm">
                    {format(post.publishedAt, "PP")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Author
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" alt={post.authorId} />
                  <AvatarFallback>{post.authorId.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.authorId}</p>
                  <p className="text-sm text-muted-foreground">
                    Content Creator
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Passionate writer and developer sharing insights about modern
                web development.
              </p>
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(post.metaTitle || post.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.metaTitle && (
                  <div>
                    <Label className="text-sm font-medium">Meta Title</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.metaTitle}
                    </p>
                  </div>
                )}
                {post.metaDescription && (
                  <div>
                    <Label className="text-sm font-medium">
                      Meta Description
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.metaDescription}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      /blog/{post.slug}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                asChild>
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share Post
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview Live
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
