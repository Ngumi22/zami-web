import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BlogFormSkeleton } from "@/components/admin/blog-sections/blog-form-skelton";
import { getAllBlogCategories, getBlogPost } from "@/data/blog";
import { getAllUsers } from "@/lib/user-actions";
import BlogPostForm from "@/components/admin/blog-sections/blog-post-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPost(id);
  const categories = await getAllBlogCategories();
  const authors = await getAllUsers();

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto py-4">
      <Suspense fallback={<BlogFormSkeleton />}>
        <BlogPostForm
          post={post}
          mode="edit"
          authors={authors}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
