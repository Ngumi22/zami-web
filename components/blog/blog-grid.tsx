import { BlogPost } from "@prisma/client";
import { BlogCard } from "./blog.card";

interface BlogGridProps {
  posts: BlogPost[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
