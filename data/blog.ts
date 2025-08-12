"use server";

import prisma from "@/lib/prisma";
import { toPrismaStatus } from "@/lib/blog-schema";
import { BlogSearchParams, BlogSearchResult } from "@/lib/types";
import { BlogPost } from "@prisma/client";

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return prisma.blogPost.findFirst({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}
export async function getPosts({
  page = 1,
  limit = 6,
  search = "",
  tag = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
} = {}) {
  const skip = (page - 1) * limit;

  const filters: any = {};

  if (search) {
    filters.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  if (tag) {
    filters.tags = {
      has: tag.toLowerCase(),
    };
  }

  const [totalPosts, posts] = await Promise.all([
    prisma.blogPost.count({ where: filters }),
    prisma.blogPost.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  return {
    posts,
    totalPages,
    totalPosts,
    currentPage: page,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  return prisma.blogPost.findFirst({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    select: { slug: true },
    orderBy: { createdAt: "desc" },
  });
  return posts.map((post: any) => post.slug);
}

export async function getBlogTags(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    select: { tags: true },
  });

  const allTags = posts.flatMap((post: any) => post.tags) as string[];
  return Array.from(new Set(allTags)).sort();
}

export async function getRelatedPosts(
  postId: string,
  tags: string[],
  limit = 3
): Promise<BlogPost[]> {
  const relatedByTags = await prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      tags: { hasSome: tags },
      status: "PUBLISHED",
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  if (relatedByTags.length < limit) {
    const remaining = limit - relatedByTags.length;
    const recentPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        status: "PUBLISHED",
        NOT: { id: { in: relatedByTags.map((p: any) => p.id) } },
      },
      take: remaining,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
    return [...relatedByTags, ...recentPosts];
  }

  return relatedByTags;
}

export async function searchBlogPosts(
  params: BlogSearchParams
): Promise<BlogSearchResult> {
  const {
    query = "",
    category,
    status,
    author,
    tags = [],
    dateFrom,
    dateTo,
    featured,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const skip = (page - 1) * limit;
  const orderBy = { [sortBy]: sortOrder };

  const where: any = {
    status: status ? toPrismaStatus(status) : "PUBLISHED",
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { tags: { hasSome: [query] } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (author) {
    where.authorId = author;
  }

  if (tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  if (featured !== undefined) {
    where.featured = featured;
  }

  if (dateFrom || dateTo) {
    where.publishedAt = {};
    if (dateFrom) where.publishedAt.gte = new Date(dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.publishedAt.lte = endDate;
    }
  }

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  const [categories, authors] = await Promise.all([
    prisma.blogCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const allTags = await getBlogTags();

  return {
    posts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPreviousPage: page > 1,
    categories: categories.map((c: any) => c.id),
    authors: authors.map((a: any) => a.id),
    allTags,
  };
}

export async function getAllBlogCategories() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      postCount: true,
    },
  });

  return categories;
}
