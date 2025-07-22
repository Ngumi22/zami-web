import { z } from "zod";

const productVariantSchema = z.object({
  id: z.string().min(1, "Variant ID is required."),
  name: z
    .string()
    .min(1, "Variant name is required.")
    .max(100, "Variant name cannot exceed 100 characters.")
    .regex(
      /^[a-zA-Z0-9\s\-_.,()&]+$/,
      "Variant name contains invalid characters."
    ),
  type: z
    .string()
    .min(1, "Variant type is required.")
    .max(50, "Variant type cannot exceed 50 characters.")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Variant type contains invalid characters."),
  value: z
    .string()
    .min(1, "Variant value is required.")
    .max(100, "Variant value cannot exceed 100 characters.")
    .regex(
      /^[a-zA-Z0-9\s\-_.,()&#]+$/,
      "Variant value contains invalid characters."
    ),
  priceModifier: z.coerce
    .number()
    .min(-999999, "Price modifier is too low.")
    .max(999999, "Price modifier is too high."),
  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock must be a non-negative integer.")
    .max(999999, "Stock quantity is too high."),
  sku: z
    .string()
    .max(50, "SKU cannot exceed 50 characters.")
    .regex(
      /^[a-zA-Z0-9\-_]*$/,
      "SKU can only contain letters, numbers, hyphens, and underscores."
    )
    .nullable()
    .optional(),
});

export const productFormSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters.")
    .max(255, "Product name cannot exceed 255 characters.")
    .regex(
      /^[a-zA-Z0-9\s\-_.,()&]+$/,
      "Product name contains invalid characters."
    )
    .refine(
      (val) => !/<script|javascript:|data:|on\w+=/i.test(val),
      "Product name contains potentially harmful content."
    ),
  slug: z
    .string()
    .min(3, "SEO slug must be at least 3 characters.")
    .max(255, "SEO slug cannot exceed 255 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "SEO slug must be kebab-case (e.g., 'product-name')."
    ),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters.")
    .max(500, "Short description cannot exceed 500 characters.")
    .refine(
      (val) => !/<script|javascript:|data:|on\w+=/i.test(val),
      "Short description contains potentially harmful content."
    ),
  description: z
    .string()
    .min(20, "Full description must be at least 20 characters.")
    .max(10000, "Description cannot exceed 10,000 characters.")
    .refine((val) => {
      const textContent = val.replace(/<[^>]*>/g, "").trim();
      return textContent.length >= 20;
    }, "Full description must contain at least 20 characters of actual content.")
    .refine(
      (val) => !/<script|javascript:|data:|on\w+=/i.test(val),
      "Description contains potentially harmful content."
    ),
  categoryId: z.string().min(1, "Category is required."),
  brandId: z.string().min(1, "Brand is required."),
  price: z.coerce
    .number()
    .min(0.01, "Price must be greater than 0.")
    .max(999999.99, "Price cannot exceed $999,999.99."),
  originalPrice: z.coerce
    .number()
    .min(0, "Original price must be non-negative.")
    .max(999999.99, "Original price cannot exceed $999,999.99.")
    .optional()
    .nullable(),
  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be a non-negative integer.")
    .max(999999, "Stock quantity cannot exceed 999,999."),
  featured: z.boolean().default(false),
  mainImage: z
    .string()
    .min(1, "Main image is required.")
    .refine((val) => {
      // Allow UploadThing URLs (ufs.sh domain) and standard HTTP/HTTPS URLs
      if (
        val.includes("ufs.sh") ||
        val.startsWith("http://") ||
        val.startsWith("https://")
      ) {
        // For UploadThing URLs, just check they exist and are not empty
        if (val.includes("ufs.sh")) {
          return val.length > 0;
        }
        // For regular URLs, validate as URL with image extension
        try {
          new URL(val);
          return /\.(jpg|jpeg|png|webp|svg)(\?.*)?$/i.test(val);
        } catch {
          return false;
        }
      }
      // Allow other file paths
      return val.length > 0;
    }, "Please upload a valid image file."),
  thumbnailImages: z
    .array(
      z.string().refine((val) => {
        // Allow UploadThing URLs (ufs.sh domain) and standard HTTP/HTTPS URLs
        if (
          val.includes("ufs.sh") ||
          val.startsWith("http://") ||
          val.startsWith("https://")
        ) {
          // For UploadThing URLs, just check they exist and are not empty
          if (val.includes("ufs.sh")) {
            return val.length > 0;
          }
          // For regular URLs, validate as URL with image extension
          try {
            new URL(val);
            return /\.(jpg|jpeg|png|webp|svg)(\?.*)?$/i.test(val);
          } catch {
            return false;
          }
        }
        return val.length > 0;
      }, "Please upload valid image files.")
    )
    .max(4, "You can upload a maximum of 4 thumbnail images.")
    .default([]),
  specifications: z
    .record(
      z.string().min(1, "Specification key cannot be empty."),
      z
        .string()
        .max(1000, "Specification value cannot exceed 1000 characters.")
        .refine(
          (val) => !/<script|javascript:|data:|on\w+=/i.test(val),
          "Specification contains potentially harmful content."
        )
    )
    .default({}),
  variants: z
    .array(productVariantSchema)
    .max(50, "Too many variants. Maximum 50 allowed.")
    .default([]),
  tags: z
    .array(
      z
        .string()
        .min(1, "Tag cannot be empty.")
        .max(50, "Tag cannot exceed 50 characters.")
        .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag contains invalid characters.")
        .refine(
          (val) => !/<script|javascript:|data:|on\w+=/i.test(val),
          "Tag contains potentially harmful content."
        )
    )
    .max(20, "Too many tags. Maximum 20 allowed.")
    .default([]),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
