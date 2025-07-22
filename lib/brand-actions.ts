"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { Brand } from "@prisma/client";
import { createBrandSchema, updateBrandSchema } from "./brand-schema";
import prisma from "./prisma";
import DOMPurify from "isomorphic-dompurify";

export async function createBrand(
  formData: FormData
): Promise<ActionResult<Brand>> {
  try {
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

    const existing = await prisma.brand.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return {
        success: false,
        message: "Brand with this slug already exists",
        errors: { slug: ["Slug must be unique"] },
      };
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        logo: data.logo || undefined,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/brands");

    return {
      success: true,
      message: "Brand created successfully",
      data: brand,
    };
  } catch (error) {
    console.error("Error creating brand:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating the brand",
    };
  }
}

export async function updateBrand(
  brandId: string,
  formData: FormData
): Promise<ActionResult<Brand>> {
  try {
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return { success: false, message: "Brand not found" };
    }

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

    if (validatedData.slug) {
      const slugOwner = await prisma.brand.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: { id: brandId },
        },
      });

      if (slugOwner) {
        return {
          success: false,
          message: "Brand with this slug already exists",
          errors: { slug: ["Slug must be unique"] },
        };
      }
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || undefined,
        logo: validatedData.logo || undefined,
        isActive: validatedData.isActive,
      },
    });

    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${brandId}`);

    return {
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    };
  } catch (error) {
    console.error("Error updating brand:", error);
    return {
      success: false,
      message: "An unexpected error occurred while updating the brand",
    };
  }
}

// DELETE
export async function deleteBrand(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    return {
      success: true,
      message: "Brand deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return {
      success: false,
      message: "Unexpected error while deleting the brand",
    };
  }
}
