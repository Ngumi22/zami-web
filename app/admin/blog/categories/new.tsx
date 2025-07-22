import { CreateBlogCategoryForm } from "@/components/admin/blog-sections/blog-category-form";

export default function BlogCategoriesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Blog Category</h1>
      <CreateBlogCategoryForm />
    </div>
  );
}
