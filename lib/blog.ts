// /app/blog/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  BlogActionState,
  blogCategorySchema,
  blogCategoryUpdateSchema,
  blogPostSchema,
  generateSlugFromTitle,
  toPrismaStatus,
} from "./blog-schema";
import { ActionResult } from "./types";
import { requireAuth } from "./auth-action";
import { requireRateLimit } from "./ratelimit";
import { Prisma } from "@prisma/client";

// --- Blog Category Actions ---

export async function createBlogCategoryAction(formData: FormData) {
  // 1. AUTHENTICATION & RATE LIMITING
  // Standard check to ensure the user is logged in and not spamming the endpoint.
  const user = await requireAuth();
  if (!user) return { success: false, message: "Sign In" };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  // 2. EFFICIENT DATA PARSING & VALIDATION
  // Using Object.fromEntries is cleaner than multiple formData.get() calls.
  const rawData = Object.fromEntries(formData.entries());
  const parsed = blogCategorySchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, slug, description } = parsed.data;

  // 3. DATABASE OPERATION
  try {
    // Prisma's `create` will automatically fail if the slug isn't unique,
    // as defined by the `@unique` directive in your schema.prisma.
    const category = await prisma.blogCategory.create({
      data: { name, slug, description: description || null },
    });
    revalidatePath("/admin/blog/categories");
    return { success: true, data: category };
  } catch (error) {
    // Catching the specific Prisma error for a unique constraint violation (e.g., slug exists).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A category with this slug already exists.",
      };
    }
    // Generic error for any other unexpected issues.
    console.error("Failed to create category:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function updateBlogCategoryAction(id: string, formData: FormData) {
  // 1. AUTHENTICATION & RATE LIMITING
  const user = await requireAuth();
  if (!user) return { success: false, message: "Sign In" };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  // 2. EFFICIENT DATA PARSING & VALIDATION
  const rawData = Object.fromEntries(formData.entries());
  const parsed = blogCategoryUpdateSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, slug, description } = parsed.data;

  // 3. DATABASE OPERATION WITH UNIQUE CHECK
  try {
    // The `update` operation is wrapped in a `try/catch` to handle potential errors gracefully.
    const updated = await prisma.blogCategory.update({
      where: { id },
      data: { name, slug, description: description || null },
    });
    revalidatePath("/admin/blog/categories");
    return { success: true, data: updated };
  } catch (error) {
    // P2002: Unique constraint failed. This handles if you change the slug to one that already exists.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A category with this slug already exists.",
      };
    }
    // P2025: Record to update not found.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        message: "The category you are trying to update does not exist.",
      };
    }
    console.error("Failed to update category:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function deleteBlogCategoryAction(id: string) {
  // 1. AUTHENTICATION & RATE LIMITING
  const user = await requireAuth();
  if (!user) return { success: false, message: "Sign In" };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  // 2. RELIABILITY: PRE-DELETE CHECK
  // Prevent deleting a category that still has posts associated with it.
  // This maintains data integrity and avoids orphaned posts.
  const category = await prisma.blogCategory.findUnique({
    where: { id },
    select: { postCount: true }, // Only fetch the field we need.
  });

  if (!category) {
    return { success: false, message: "Category not found." };
  }
  if (category.postCount > 0) {
    return {
      success: false,
      message:
        "Cannot delete a category that contains posts. Please reassign the posts first.",
    };
  }

  // 3. DATABASE OPERATION
  try {
    await prisma.blogCategory.delete({ where: { id } });
    revalidatePath("/admin/blog/categories");
    return { success: true };
  } catch (error) {
    // P2025: In case the category was deleted by another process between our check and this call.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, message: "Category not found." };
    }
    console.error("Failed to delete category:", error);
    return { success: false, message: "Failed to delete category" };
  }
}

// --- Blog Post Actions ---

export async function createBlogPostAction(
  prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  // 1. AUTHENTICATION & RATE LIMITING
  const user = await requireAuth();
  if (!user) return { success: false, message: "Sign In" };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  // 2. EFFICIENT DATA PARSING & VALIDATION
  // Use Object.fromEntries to convert FormData to a plain object.
  const rawData = Object.fromEntries(formData.entries());

  // Prepare the data for validation, handling type conversions.
  const dataToValidate = {
    ...rawData,
    // The slug is generated from the title if not provided.
    slug: rawData.slug || generateSlugFromTitle(rawData.title as string),
    // Tags are received as a JSON string and must be parsed into an array.
    tags: JSON.parse((rawData.tags as string) || "[]"),
    // The 'featured' checkbox comes in as the string "true" or is absent.
    featured: rawData.featured === "true",
    // The status string is converted to the corresponding Prisma enum value.
    status: toPrismaStatus(rawData.status as string),
  };

  const validatedFields = blogPostSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  // Use the fully validated and typed data from here on.
  const blogData = validatedFields.data;

  // 3. ATOMIC & RELIABLE DATABASE OPERATION
  try {
    const post = await prisma.$transaction(async (tx) => {
      // Create the post within the transaction.
      const newPost = await tx.blogPost.create({
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
          // Handle publishedAt logic: set to now if publishing, else use provided date.
          publishedAt:
            blogData.status === "PUBLISHED" && !blogData.publishedAt
              ? new Date()
              : blogData.publishedAt
              ? new Date(blogData.publishedAt)
              : null,
          // SECURITY: The author ID is ALWAYS taken from the authenticated session.
          author: { connect: { id: user.id } },
          category: { connect: { id: blogData.categoryId } },
        },
      });

      // Increment the category count within the same transaction.
      await tx.blogCategory.update({
        where: { id: blogData.categoryId },
        data: { postCount: { increment: 1 } },
      });

      return newPost;
    });

    // 4. REVALIDATION & SUCCESS
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return {
      success: true,
      message: `Post "${post.title}" created successfully!`,
      data: { slug: post.slug },
    };
  } catch (error) {
    // Handle specific Prisma error for unique constraint violation (e.g., slug exists).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A post with this slug already exists.",
        errors: { slug: ["This slug is already taken."] },
      };
    }

    console.error("Error creating blog post:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function updateBlogPostAction(
  postId: string,
  prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  // 1. AUTHENTICATION & RATE LIMITING
  const user = await requireAuth();
  if (!user) return { success: false, message: "Sign In" };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  // 2. AUTHORIZATION & DATA FETCHING
  const currentPost = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { authorId: true, categoryId: true },
  });

  if (!currentPost) {
    return { success: false, message: "Post not found." };
  }
  // Crucial authorization check: ensure the user owns the post.
  if (currentPost.authorId !== user.id) {
    return {
      success: false,
      message: "You are not authorized to edit this post.",
    };
  }

  // 3. EFFICIENT DATA PARSING & VALIDATION
  const rawData = Object.fromEntries(formData.entries());
  const dataToValidate = {
    ...rawData,
    slug: rawData.slug || generateSlugFromTitle(rawData.title as string),
    tags: JSON.parse((rawData.tags as string) || "[]"),
    featured: rawData.featured === "true",
    status: toPrismaStatus(rawData.status as string),
  };

  const validatedFields = blogPostSchema.safeParse(dataToValidate);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const blogData = validatedFields.data;

  // 4. ATOMIC & RELIABLE DATABASE OPERATION
  try {
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Update the main post record.
      const post = await tx.blogPost.update({
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
          // SECURITY: Re-assert the author ID from the session.
          author: { connect: { id: user.id } },
          category: { connect: { id: blogData.categoryId } },
        },
      });

      // If the category has changed, update the counts atomically.
      if (currentPost.categoryId !== blogData.categoryId) {
        // Decrement the old category's count.
        await tx.blogCategory.update({
          where: { id: currentPost.categoryId },
          data: { postCount: { decrement: 1 } },
        });
        // Increment the new category's count.
        await tx.blogCategory.update({
          where: { id: blogData.categoryId },
          data: { postCount: { increment: 1 } },
        });
      }

      return post;
    });

    // 5. REVALIDATION & SUCCESS
    revalidatePath("/admin/blog");
    revalidatePath(`/blog/${updatedPost.slug}`);
    return {
      success: true,
      message: `Post "${updatedPost.title}" updated successfully!`,
      data: { slug: updatedPost.slug },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A post with this slug already exists.",
        errors: { slug: ["This slug is already taken."] },
      };
    }
    console.error("Error updating blog post:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult<null>> {
  // 1. AUTHENTICATION & RATE LIMITING
  const user = await requireAuth();
  if (!user) return { success: false, message: "Sign In" };
  await requireRateLimit({ identifier: user.id, max: 10, windowSec: 60 });

  // 2. ATOMIC & SECURE DELETE
  try {
    // A transaction ensures the post is deleted AND the category count is decremented together.
    await prisma.$transaction(async (tx) => {
      // First, find the post to verify ownership AND get its categoryId.
      const postToDelete = await tx.blogPost.findUnique({
        where: { id },
        select: { authorId: true, categoryId: true },
      });

      // AUTHORIZATION: Throw an error if the post doesn't exist or user is not the owner.
      if (!postToDelete || postToDelete.authorId !== user.id) {
        throw new Error("Post not found or user not authorized.");
      }

      // If found and authorized, delete it.
      await tx.blogPost.delete({ where: { id } });

      // And decrement the associated category's count.
      if (postToDelete.categoryId) {
        await tx.blogCategory.update({
          where: { id: postToDelete.categoryId },
          data: { postCount: { decrement: 1 } },
        });
      }
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, message: "Post deleted successfully" };
  } catch (error: any) {
    // The custom error from our authorization check.
    if (error.message.includes("not authorized")) {
      return {
        success: false,
        message: "Post not found or you are not authorized to delete it.",
      };
    }
    console.error("Error deleting blog post:", error);
    return {
      success: false,
      message: "An unexpected error occurred while deleting the post",
    };
  }
}
