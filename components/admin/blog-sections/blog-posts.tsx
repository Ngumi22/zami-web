"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  User,
  Tag,
  TrendingUp,
  FileText,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { BlogPagePagination } from "@/components/admin/blog-sections/pagination";

import { BlogSearchFilters } from "@/components/admin/blog-sections/search-filters";
import { BlogSearchParams, BlogSearchResult } from "@/lib/types";
import { searchBlogPosts } from "@/data/blog";

export default function BlogPostsPageClient({
  initialSearchResult,
  pageSize: initialPageSize,
}: {
  initialSearchResult: BlogSearchResult;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchResult, setSearchResult] =
    useState<BlogSearchResult>(initialSearchResult);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Function to load posts based on specified parameters.
  const loadPosts = useCallback(
    async (params: BlogSearchParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await searchBlogPosts({ ...params, limit: pageSize });
        setSearchResult(result);

        // Update URL query string with new search parameters.
        const newSearchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                newSearchParams.set(key, value.join(","));
              }
            } else {
              newSearchParams.set(key, String(value));
            }
          }
        });
        router.push(`?${newSearchParams.toString()}`);
      } catch (err) {
        setError("Failed to load blog posts. Please try again.");
        console.error("Error loading posts:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, router]
  );

  // Effect to reload posts when search parameters change.
  useEffect(() => {
    const newParams: BlogSearchParams = {
      query: searchParams.get("query") || undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      author: searchParams.get("author") || undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
      featured:
        searchParams.get("featured") === "true"
          ? true
          : searchParams.get("featured") === "false"
          ? false
          : undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: pageSize,
    };
    // setSearchResult(initialSearchResult);
  }, [searchParams, pageSize, initialSearchResult]);

  // Handler for when search filters change.
  const handleFiltersChange = useCallback(
    (filters: any) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key].length > 0) {
          currentParams.set(key, filters[key]);
        } else {
          currentParams.delete(key);
        }
      });
      currentParams.set("page", "1");
      router.push(`?${currentParams.toString()}`);
    },
    [searchParams, router]
  );

  // Handler for when the page number changes.
  const handlePageChange = useCallback(
    (page: number) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("page", page.toString());
      router.push(`?${currentParams.toString()}`);
    },
    [searchParams, router]
  );

  // Handler for when the page size changes.
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("page", "1"); // Reset to first page
      router.push(`?${currentParams.toString()}`);
    },
    [searchParams, router]
  );

  // Determines the color of the status badge based on the post's status.
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

  // Computes statistics about the blog posts.
  const stats = searchResult
    ? {
        total: searchResult.totalCount,
        published: searchResult.posts.filter((p) => p.status === "PUBLISHED")
          .length,
        drafts: searchResult.posts.filter((p) => p.status === "DRAFT").length,
        totalViews: searchResult.posts.reduce((sum, p) => sum + p.views, 0),
      }
    : { total: 0, published: 0, drafts: 0, totalViews: 0 };

  // Main render method for the component.
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize your blog content
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {searchResult?.totalCount !== stats.total
                ? `${searchResult?.totalCount || 0} total`
                : "All blog posts"}
            </p>
          </CardContent>
        </Card>
        {/* Additional stat cards for Published, Drafts, and Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.published}
            </div>
            <p className="text-xs text-muted-foreground">Live posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.drafts}
            </div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      {searchResult && (
        <div className="mb-6">
          <BlogSearchFilters
            categories={searchResult.categories}
            authors={searchResult.authors}
            allTags={searchResult.allTags}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading blog posts...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!isLoading && searchResult && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {searchResult.totalCount === 0
                ? "No posts found"
                : `Showing ${searchResult.posts.length} of ${searchResult.totalCount} posts`}
            </p>
          </div>

          {/* Posts Grid */}
          {searchResult.posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {searchResult.posts.map((post) => (
                <Card
                  key={post.id}
                  className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
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
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/admin/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {post.featuredImage && (
                      <div className="mb-4">
                        <img
                          src={post.featuredImage || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.authorId}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views} views
                        </div>
                        <Badge variant="secondary">{post.categoryId}</Badge>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/blog/${post.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters to find what you
                  are looking for.
                </p>
                <Button variant="outline" onClick={() => router.push("?")}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {searchResult.totalPages > 1 && (
            <div className="mt-6">
              <BlogPagePagination
                currentPage={searchResult.currentPage}
                totalPages={searchResult.totalPages}
                totalCount={searchResult.totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={isLoading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
