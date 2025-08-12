"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { Brand } from "@prisma/client";
import { createBrandSchema, updateBrandSchema } from "./brand-schema";
import prisma from "./prisma";
import DOMPurify from "isomorphic-dompurify";
import { Prisma } from "@prisma/client";
import { withAdminAuth } from "./auth-action";

export const createBrand = withAdminAuth(
  async (formData: FormData): Promise<ActionResult<Brand>> => {
    const rawData = {
      name: DOMPurify.sanitize((formData.get("name") as string) || ""),
      slug: ((formData.get("slug") as string) || "").toLowerCase().trim(),
      description: DOMPurify.sanitize(
        (formData.get("description") as string) || ""
      ),
      logo: ((formData.get("logo") as string) || "").trim(),
      isActive: formData.get("isActive") !== "false",
    };

    const parsed = createBrandSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    try {
      const brand = await prisma.$transaction(async (tx) => {
        const existing = await tx.brand.findUnique({
          where: { slug: data.slug },
        });

        if (existing) {
          throw new Error("Brand with this slug already exists");
        }

        return await tx.brand.create({
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description || undefined,
            logo: data.logo || undefined,
            isActive: data.isActive,
          },
        });
      });

      revalidatePath("/admin/brands");

      return {
        success: true,
        message: "Brand created successfully",
        data: brand,
      };
    } catch (error: any) {
      if (error.message === "Brand with this slug already exists") {
        return {
          success: false,
          message: "Brand with this slug already exists",
          errors: { slug: ["Slug must be unique"] },
        };
      }
      console.error("Error creating brand:", error);
      return {
        success: false,
        message: "An unexpected error occurred while creating the brand",
      };
    }
  }
);

export const updateBrand = withAdminAuth(
  async (brandId: string, formData: FormData): Promise<ActionResult<Brand>> => {
    const rawData = {
      id: brandId,
      name: DOMPurify.sanitize((formData.get("name") as string) || ""),
      slug: ((formData.get("slug") as string) || "").toLowerCase().trim(),
      description: DOMPurify.sanitize(
        (formData.get("description") as string) || ""
      ),
      logo: ((formData.get("logo") as string) || "").trim(),
      isActive: formData.get("isActive") !== "false",
    };

    const validationResult = updateBrandSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    try {
      const updatedBrand = await prisma.$transaction(async (tx) => {
        const slugOwner = await tx.brand.findFirst({
          where: {
            slug: validatedData.slug,
            NOT: { id: brandId },
          },
        });

        if (slugOwner) {
          throw new Error("Brand with this slug already exists");
        }

        return await tx.brand.update({
          where: { id: brandId },
          data: {
            name: validatedData.name,
            slug: validatedData.slug,
            description: validatedData.description || undefined,
            logo: validatedData.logo || undefined,
            isActive: validatedData.isActive,
          },
        });
      });

      revalidatePath("/admin/brands");
      revalidatePath(`/admin/brands/${brandId}`);

      return {
        success: true,
        message: "Brand updated successfully",
        data: updatedBrand,
      };
    } catch (error: any) {
      if (error.message === "Brand with this slug already exists") {
        return {
          success: false,
          message: "Brand with this slug already exists",
          errors: { slug: ["Slug must be unique"] },
        };
      }
      console.error("Error updating brand:", error);
      return {
        success: false,
        message: "An unexpected error occurred while updating the brand",
      };
    }
  }
);

export const deleteBrand = withAdminAuth(
  async (id: string): Promise<ActionResult<null>> => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.product.deleteMany({
          where: { brandId: id },
        });

        await tx.brand.delete({
          where: { id },
        });
      });

      revalidatePath("/admin/brands");

      return {
        success: true,
        message: "Brand and associated products deleted successfully",
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(
          "Prisma error deleting brand:",
          error.code,
          error.message
        );
        return {
          success: false,
          message: "Database error: Failed to delete brand.",
        };
      }
      console.error("Error deleting brand:", error);
      return {
        success: false,
        message: "Unexpected error while deleting the brand",
      };
    }
  }
);
