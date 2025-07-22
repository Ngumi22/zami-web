import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { searchBlogPosts } from "@/data/blog";
import { BlogSearchParams } from "@/lib/types";

const BlogPostsClient = dynamic(
  () => import("@/components/admin/blog-sections/blog-post-client"),
  {
    loading: () => (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading initial blog posts...</span>
          </div>
        </CardContent>
      </Card>
    ),
  }
);

function parsePositiveInt(
  value: string | undefined,
  defaultValue: number,
  max?: number
): number {
  const parsed = Number.parseInt(value || "", 10);
  if (Number.isNaN(parsed) || parsed <= 0) return defaultValue;
  if (max && parsed > max) return max;
  return parsed;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    category?: string;
    status?: string;
    author?: string;
    tags?: string;
    featured?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const {
    query,
    category,
    status,
    author,
    tags,
    featured,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    limit,
  } = await searchParams;

  const initialParams: BlogSearchParams = {
    query: query || undefined,
    category: category || undefined,
    status: status || undefined,
    author: author || undefined,
    tags: tags?.split(",").filter(Boolean) || [],
    featured:
      featured === "true" ? true : featured === "false" ? false : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy: (
      ["createdAt", "updatedAt", "publishedAt", "title", "views"] as const
    ).includes(sortBy as any)
      ? (sortBy as
          | "createdAt"
          | "updatedAt"
          | "publishedAt"
          | "title"
          | "views")
      : "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
    page: parsePositiveInt(page, 1),
    limit: parsePositiveInt(limit, 12, 50),
  };

  let initialSearchResult = null;
  let initialError: string | null = null;

  try {
    initialSearchResult = await searchBlogPosts(initialParams);
  } catch (err) {
    console.error("Server-side error loading initial posts:", err);
    initialError = "Failed to load initial blog posts. Please try again.";
  }

  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading blog page...</span>
            </div>
          </CardContent>
        </Card>
      }>
      <BlogPostsClient
        initialSearchResult={initialSearchResult}
        initialError={initialError}
        initialPageSize={initialParams.limit ?? 12}
      />
    </Suspense>
  );
}
