import { BlogPostStatus } from "@prisma/client";
import DOMPurify from "isomorphic-dompurify";
import z from "zod";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be less than 100 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only"
  )
  .refine(
    (slug) => !slug.startsWith("-") && !slug.endsWith("-"),
    "Slug cannot start or end with a hyphen"
  );

export const generateSlugSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const checkSlugSchema = z.object({
  slug: slugSchema,
  excludeId: z.string().optional(),
});

const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style"],
  });
};

export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  slug: slugSchema,
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters")
    .trim(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content is too long")
    .transform(sanitizeHtml),
  authorId: z.string().min(1, "Author is required"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
    errorMap: () => ({
      message: "Status must be DRAFT, PUBLISHED, or ARCHIVED",
    }),
  }),
  featuredImage: z
    .string()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),
  metaTitle: z
    .string()
    .max(60, "Meta title should be under 60 characters for SEO")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description should be under 160 characters for SEO")
    .optional(),
  publishedAt: z.string().datetime().optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type BlogActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

export const toPrismaStatus = (status: string): BlogPostStatus => {
  return status.toUpperCase() as BlogPostStatus;
};

export const blogCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    }),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const blogCategoryUpdateSchema = blogCategorySchema.partial();
