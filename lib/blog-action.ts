"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
import { withAdminAuth } from "./auth-action";
import { Prisma } from "@prisma/client";

// =======================================================================
// SHARED UTILITIES
// =======================================================================

const MAX_SLUG_RETRIES = 5;

function generateUniqueSlug(baseSlug: string, attempt: number) {
  return attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;
}

function parseTagsSafely(tags: string) {
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

function resolvePublishedDate(status: string, dateString?: string | Date) {
  if (status === "PUBLISHED" && !dateString) return new Date();
  return dateString ? new Date(dateString) : null;
}

// =======================================================================
// BLOG CATEGORY ACTIONS
// =======================================================================

export const createBlogCategoryAction = withAdminAuth(
  async (_user, formData: FormData): Promise<ActionResult> => {
    try {
      const parsed = blogCategorySchema.safeParse(
        Object.fromEntries(formData.entries())
      );

      if (!parsed.success) {
        return {
          success: false,
          message: "Invalid data provided",
          errors: parsed.error.flatten().fieldErrors,
        };
      }

      const { name, slug, description } = parsed.data;

      const category = await prisma.blogCategory.create({
        data: {
          name,
          slug,
          description: description || null,
        },
      });

      revalidatePath("/admin/blog/categories");
      revalidateTag("blog-categories");
      return { success: true, message: "Category created", data: category };
    } catch (error) {
      console.error("Create category error:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            message: "Slug already exists",
            errors: { slug: ["This slug is already in use"] },
          };
        }
      }

      return { success: false, message: "Operation failed" };
    }
  }
);

export const updateBlogCategoryAction = withAdminAuth(
  async (_user, id: string, formData: FormData): Promise<ActionResult> => {
    try {
      const parsed = blogCategoryUpdateSchema.safeParse(
        Object.fromEntries(formData.entries())
      );

      if (!parsed.success) {
        return {
          success: false,
          message: "Invalid data provided",
          errors: parsed.error.flatten().fieldErrors,
        };
      }

      const updatedCategory = await prisma.blogCategory.update({
        where: { id },
        data: parsed.data,
      });

      revalidatePath("/admin/blog/categories");
      revalidatePath(`/admin/blog/categories/${id}`);
      revalidateTag("blog-categories");
      return {
        success: true,
        message: "Category updated",
        data: updatedCategory,
      };
    } catch (error) {
      console.error(`Update category error [${id}]:`, error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            message: "Slug already exists",
            errors: { slug: ["This slug is already in use"] },
          };
        }
      }

      return { success: false, message: "Operation failed" };
    }
  }
);

export const deleteBlogCategoryAction = withAdminAuth(
  async (_user, id: string): Promise<ActionResult> => {
    try {
      await prisma.$transaction(async (tx) => {
        const postCount = await tx.blogPost.count({
          where: { categoryId: id },
        });

        if (postCount > 0) {
          throw new Error(`Category contains ${postCount} posts`);
        }

        await tx.blogCategory.delete({ where: { id } });
      });

      revalidatePath("/admin/blog/categories");
      revalidateTag("blog-categories");
      return { success: true, message: "Category deleted" };
    } catch (error: any) {
      console.error(`Delete category error [${id}]:`, error);

      if (error.message.includes("contains")) {
        return {
          success: false,
          message: error.message,
        };
      }

      return { success: false, message: "Operation failed" };
    }
  }
);

// =======================================================================
// BLOG POST ACTIONS
// =======================================================================

export const createBlogPostAction = withAdminAuth(
  async (
    admin,
    _prevState: BlogActionState,
    formData: FormData
  ): Promise<ActionResult> => {
    try {
      let rawData = Object.fromEntries(formData.entries());
      rawData.slug =
        rawData.slug || generateSlugFromTitle(rawData.title as string);

      const validatedFields = blogPostSchema.safeParse({
        ...rawData,
        status: toPrismaStatus(rawData.status as string),
        tags: parseTagsSafely(rawData.tags as string),
        featured: rawData.featured === "true",
        publishedAt: rawData.publishedAt
          ? new Date(rawData.publishedAt as string)
          : undefined,
      });

      if (!validatedFields.success) {
        return {
          success: false,
          message: "Validation failed",
          errors: validatedFields.error.flatten().fieldErrors,
        };
      }

      const blogData = validatedFields.data;
      let createdSlug = "";
      let attempt = 0;

      while (attempt < MAX_SLUG_RETRIES) {
        try {
          const result = await prisma.$transaction(async (tx) => {
            const post = await tx.blogPost.create({
              data: {
                ...blogData,
                slug: generateUniqueSlug(blogData.slug, attempt),
                publishedAt: resolvePublishedDate(
                  blogData.status,
                  blogData.publishedAt
                ),
                authorId: admin.id,
                categoryId: blogData.categoryId,
              },
            });

            await tx.blogCategory.update({
              where: { id: blogData.categoryId },
              data: { postCount: { increment: 1 } },
            });

            return post;
          });

          createdSlug = result.slug;
          break;
        } catch (error: any) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002" &&
            Array.isArray(error.meta?.target) &&
            error.meta.target.includes("slug")
          ) {
            attempt++;
            if (attempt >= MAX_SLUG_RETRIES) {
              throw new Error("Slug generation failed after multiple attempts");
            }
          } else {
            throw error;
          }
        }
      }

      revalidateTag("blog-posts");
      revalidateTag(`post-${createdSlug}`);
      return {
        success: true,
        message: "Post created successfully",
        data: { slug: createdSlug },
      };
    } catch (error: any) {
      console.error("Create post error:", error);

      if (error.message && error.message.includes("Slug")) {
        return {
          success: false,
          message: "Slug conflict. Please try again",
        };
      }

      return {
        success: false,
        message: "Operation failed",
      };
    }
  }
);

export const updateBlogPostAction = withAdminAuth(
  async (
    admin,
    postId: string,
    _prevState: BlogActionState,
    formData: FormData
  ): Promise<ActionResult> => {
    try {
      const rawData = Object.fromEntries(formData.entries());
      const validatedFields = blogPostSchema.safeParse({
        ...rawData,
        status: toPrismaStatus(rawData.status as string),
        tags: parseTagsSafely(rawData.tags as string),
        featured: rawData.featured === "true",
        publishedAt: rawData.publishedAt
          ? new Date(rawData.publishedAt as string)
          : undefined,
      });

      if (!validatedFields.success) {
        return {
          success: false,
          message: "Validation failed",
          errors: validatedFields.error.flatten().fieldErrors,
        };
      }

      const blogData = validatedFields.data;
      let updatedSlug = blogData.slug;
      let attempt = 0;
      let originalCategoryId = "";

      while (attempt < MAX_SLUG_RETRIES) {
        try {
          const result = await prisma.$transaction(async (tx) => {
            const currentPost = await tx.blogPost.findUnique({
              where: { id: postId },
              select: { categoryId: true },
            });

            if (!currentPost) throw new Error("Post not found");
            originalCategoryId = currentPost.categoryId;

            const updatedPost = await tx.blogPost.update({
              where: { id: postId },
              data: {
                ...blogData,
                slug: generateUniqueSlug(blogData.slug, attempt),
                publishedAt: resolvePublishedDate(
                  blogData.status,
                  blogData.publishedAt
                ),
                authorId: admin.id,
              },
            });

            // Update category counts if needed
            if (originalCategoryId !== blogData.categoryId) {
              await Promise.all([
                tx.blogCategory.update({
                  where: { id: originalCategoryId },
                  data: { postCount: { decrement: 1 } },
                }),
                tx.blogCategory.update({
                  where: { id: blogData.categoryId },
                  data: { postCount: { increment: 1 } },
                }),
              ]);
            }

            return updatedPost;
          });

          updatedSlug = result.slug;
          break;
        } catch (error: any) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002" &&
            Array.isArray(error.meta?.target) &&
            error.meta.target.includes("slug")
          ) {
            attempt++;
            if (attempt >= MAX_SLUG_RETRIES) {
              throw new Error("Slug update failed after multiple attempts");
            }
          } else {
            throw error;
          }
        }
      }

      // Clear all relevant cache
      revalidateTag("blog-posts");
      revalidateTag(`post-${updatedSlug}`);
      revalidateTag(`post-${postId}`);

      return {
        success: true,
        message: "Post updated successfully",
        data: { slug: updatedSlug },
      };
    } catch (error: any) {
      console.error(`Update post error [${postId}]:`, error);

      if (error.message && error.message.includes("Slug")) {
        return {
          success: false,
          message: "Slug conflict. Please try again",
        };
      }

      return {
        success: false,
        message: "Operation failed",
      };
    }
  }
);

export const deleteBlogPostAction = withAdminAuth(
  async (_user, id: string): Promise<ActionResult> => {
    try {
      await prisma.$transaction(async (tx) => {
        const post = await tx.blogPost.findUnique({
          where: { id },
          select: { categoryId: true },
        });

        if (!post) throw new Error("Post not found");
        if (!post.categoryId) return;

        await tx.blogPost.delete({ where: { id } });
        await tx.blogCategory.update({
          where: { id: post.categoryId },
          data: { postCount: { decrement: 1 } },
        });
      });

      revalidateTag("blog-posts");
      revalidateTag(`post-${id}`);
      return { success: true, message: "Post deleted" };
    } catch (error: any) {
      console.error(`Delete post error [${id}]:`, error);
      return {
        success: false,
        message: "Operation failed",
      };
    }
  }
);

// =======================================================================
// UTILITY ACTIONS
// =======================================================================

export const generateUniqueSlugAction = withAdminAuth(
  async (_user, title: string): Promise<ActionResult<string>> => {
    try {
      const validation = generateSlugSchema.safeParse({ title });
      if (!validation.success) {
        return {
          success: false,
          message: "Invalid title",
        };
      }

      const baseSlug = generateSlugFromTitle(validation.data.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.blogPost.findUnique({
          where: { slug },
        });

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;

        if (counter > MAX_SLUG_RETRIES) {
          return {
            success: false,
            message: "Slug generation failed",
          };
        }
      }

      return { success: true, message: "Slug generated", data: slug };
    } catch (error) {
      console.error("Slug generation error:", error);
      return {
        success: false,
        message: "Operation failed",
      };
    }
  }
);
