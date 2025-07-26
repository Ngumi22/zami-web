"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  BlogActionState,
  blogCategorySchema,
  blogCategoryUpdateSchema,
  blogPostSchema,
  generateSlugFromTitle,
  generateSlugSchema,
  toPrismaStatus,
} from "./blog-schema";
import { ActionResult } from "./types";
import { requireAuth } from "./auth-action";

export async function createBlogCategoryAction(formData: FormData) {
  await requireAuth();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const parsed = blogCategorySchema.safeParse({ name, slug, description });
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const exists = await prisma.blogCategory.findUnique({ where: { slug } });
  if (exists) return { success: false, message: "Slug already exists" };

  const category = await prisma.blogCategory.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/admin/blog/categories");

  return { success: true, data: category };
}

export async function updateBlogCategoryAction(id: string, formData: FormData) {
  await requireAuth();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const parsed = blogCategoryUpdateSchema.safeParse({
    name,
    slug,
    description,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Category not found" };

  const updated = await prisma.blogCategory.update({
    where: { id },
    data: {
      ...parsed.data,
    },
  });

  revalidatePath("/admin/blog/categories");

  return { success: true, data: updated };
}

export async function deleteBlogCategoryAction(id: string) {
  await requireAuth();
  try {
    await prisma.blogCategory.delete({ where: { id } });
    revalidatePath("/admin/blog/categories");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete category" };
  }
}

export async function createBlogPostAction(
  prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  await requireAuth();
  try {
    const rawData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      authorId: formData.get("authorId") as string,
      categoryId: formData.get("categoryId") as string,
      status: formData.get("status") as string,
      featuredImage: formData.get("featuredImage") as string,
      tags: JSON.parse((formData.get("tags") as string) || "[]") as string[],
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
      publishedAt: formData.get("publishedAt") as string,
      featured: formData.get("featured") === "true",
    };

    if (!rawData.slug && rawData.title) {
      rawData.slug = generateSlugFromTitle(rawData.title);
    }

    const validatedFields = blogPostSchema.safeParse({
      ...rawData,
      status: toPrismaStatus(rawData.status),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check your inputs.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const blogData = validatedFields.data;

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: blogData.slug },
    });

    if (existingPost) {
      return {
        success: false,
        message: "A post with this slug already exists.",
        errors: { slug: ["This slug is already taken"] },
      };
    }

    const post = await prisma.blogPost.create({
      data: {
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        status: blogData.status,
        featuredImage: blogData.featuredImage || null,
        tags: blogData.tags,
        metaTitle: blogData.metaTitle || null,
        metaDescription: blogData.metaDescription || null,
        featured: blogData.featured,
        publishedAt:
          blogData.status === "PUBLISHED" && !blogData.publishedAt
            ? new Date()
            : blogData.publishedAt
            ? new Date(blogData.publishedAt)
            : null,
        author: { connect: { id: blogData.authorId } },
        category: { connect: { id: blogData.categoryId } },
      },
    });

    await prisma.blogCategory.update({
      where: { id: blogData.categoryId },
      data: { postCount: { increment: 1 } },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return {
      success: true,
      message: `Blog post "${blogData.title}" created successfully!`,
      data: { slug: post.slug },
    };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateBlogPostAction(
  postId: string,
  prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  await requireAuth();
  try {
    const rawData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      authorId: formData.get("authorId") as string,
      categoryId: formData.get("categoryId") as string,
      status: formData.get("status") as string,
      featuredImage: formData.get("featuredImage") as string,
      tags: JSON.parse((formData.get("tags") as string) || "[]") as string[],
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
      publishedAt: formData.get("publishedAt") as string,
      featured: formData.get("featured") === "true",
    };

    const validatedFields = blogPostSchema.safeParse({
      ...rawData,
      status: toPrismaStatus(rawData.status),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check your inputs.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const blogData = validatedFields.data;

    const existingPost = await prisma.blogPost.findFirst({
      where: {
        slug: blogData.slug,
        NOT: { id: postId },
      },
    });

    if (existingPost) {
      return {
        success: false,
        message: "A post with this slug already exists.",
        errors: { slug: ["This slug is already taken"] },
      };
    }

    const currentPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { categoryId: true },
    });

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        status: blogData.status,
        featuredImage: blogData.featuredImage || null,
        tags: blogData.tags,
        metaTitle: blogData.metaTitle || null,
        metaDescription: blogData.metaDescription || null,
        featured: blogData.featured,
        publishedAt:
          blogData.status === "PUBLISHED" && !blogData.publishedAt
            ? new Date()
            : blogData.publishedAt
            ? new Date(blogData.publishedAt)
            : null,
        author: { connect: { id: blogData.authorId } },
        category: { connect: { id: blogData.categoryId } },
      },
    });

    if (currentPost && currentPost.categoryId !== blogData.categoryId) {
      await Promise.all([
        prisma.blogCategory.update({
          where: { id: currentPost.categoryId },
          data: { postCount: { decrement: 1 } },
        }),
        prisma.blogCategory.update({
          where: { id: blogData.categoryId },
          data: { postCount: { increment: 1 } },
        }),
      ]);
    }

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${blogData.slug}`);

    return {
      success: true,
      message: `Blog post "${blogData.title}" updated successfully!`,
      data: { slug: post.slug },
    };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function generateSlugAction(title: string): Promise<string> {
  const validation = generateSlugSchema.safeParse({ title });
  if (!validation.success) {
    throw new Error("Title is required");
  }

  const baseSlug = generateSlugFromTitle(validation.data.title);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function saveDraftAction(
  postId: string | null,
  formData: FormData
): Promise<BlogActionState> {
  await requireAuth();
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title && !content) {
      return { success: false, message: "Nothing to save" };
    }

    if (postId) {
      await prisma.blogPost.update({
        where: { id: postId },
        data: {
          title,
          content,
          updatedAt: new Date(),
          ...(!title ? { excerpt: "" } : {}),
        },
      });
    } else {
      const slug = await generateSlugAction(title || "Untitled Post");
      await prisma.blogPost.create({
        data: {
          title: title || "Untitled Post",
          slug,
          content,
          excerpt: "",
          status: "DRAFT",
          tags: [],
          featured: false,
          author: { connect: { id: formData.get("authorId") as string } },
          category: { connect: { id: formData.get("categoryId") as string } },
        },
      });
    }

    return {
      success: true,
      message: "Draft saved successfully",
    };
  } catch (error) {
    console.error("Error saving draft:", error);
    return {
      success: false,
      message: "Failed to save draft",
    };
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult<null>> {
  await requireAuth();
  try {
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/admin/blogPosts");
    return {
      success: true,
      message: "blogPost deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting blogPost:", error);
    return {
      success: false,
      message: "Unexpected error while deleting the blogPost",
    };
  }
}
