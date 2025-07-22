import { Suspense } from "react";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogSearch } from "@/components/blog/blog-search";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { Badge } from "@/components/ui/badge";
import { getBlogTags, getPosts } from "@/data/blog";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    tag?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params.page || "1");
  const search = params.search || "";
  const tag = params.tag || "";

  const { posts, totalPages, totalPosts } = await getPosts({
    page,
    search,
    tag,
    limit: 6,
  });

  const tags = await getBlogTags();

  const startResult = (page - 1) * 6 + 1;
  const endResult = Math.min(page * 6, totalPosts);

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHero />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-gray-600">
              Showing {startResult.toString().padStart(2, "0")} -{" "}
              {endResult.toString().padStart(2, "0")} of {totalPosts} Results
            </p>

            {(search || tag) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {search && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {search}
                  </Badge>
                )}
                {tag && (
                  <Badge variant="secondary" className="text-xs">
                    Category: {tag}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <BlogSearch tags={tags} />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-300 rounded-lg overflow-hidden animate-pulse">
                  <div className="flex">
                    <div className="w-1/3 h-48 bg-gray-200"></div>
                    <div className="flex-1 p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
          <BlogGrid posts={posts} />
        </Suspense>

        {totalPages > 1 && (
          <BlogPagination
            currentPage={page}
            totalPages={totalPages}
            search={search}
            tag={tag}
          />
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const tag = params.tag || "";

  let title = "Blog - Home & Kitchen Tips";
  if (search) title = `Search: ${search} - Blog`;
  if (tag) title = `${tag} - Blog`;

  return {
    title,
    description:
      "Discover the latest tips, guides, and insights for your home and kitchen. From smart appliances to cooking techniques.",
  };
}
