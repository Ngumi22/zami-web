import { Suspense } from "react";

import { BlogFormSkeleton } from "@/components/admin/blog-sections/blog-form-skelton";
import { getAllUsers } from "@/lib/user-actions";
import { getAllBlogCategories } from "@/data/blog";
import BlogPostForm from "@/components/admin/blog-sections/blog-post-form";

export default async function NewBlogPostPage() {
  const categories = await getAllBlogCategories();
  const authors = await getAllUsers();
  return (
    <div className="mx-auto py-4">
      <Suspense fallback={<BlogFormSkeleton />}>
        <BlogPostForm mode="create" authors={authors} categories={categories} />
      </Suspense>
    </div>
  );
}
