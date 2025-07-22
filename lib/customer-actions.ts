"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { customerCreateSchema, customerUpdateSchema } from "./customer-schemas";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createCustomerAction(
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      status: formData.get("status"),
    };

    const validated = customerCreateSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    await prisma.customer.create({ data: validated.data });

    revalidatePath("/admin/customers");

    return { success: true, message: "Customer created successfully." };
  } catch (error) {
    console.error("Create error:", error);
    return {
      success: false,
      message: "Failed to create customer. Try again.",
    };
  }
}

export async function updateCustomerAction(
  customerId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      status: formData.get("status"),
    };

    const validatedFields = customerUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed. Please check your inputs.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, phone, address, status } = validatedFields.data;

    await prisma.customer.update({
      where: { id: customerId },
      data: { name, email, phone, address, status },
    });

    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath("/admin/customers");

    return {
      success: true,
      message: "Customer updated successfully!",
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      success: false,
      message: "Failed to update customer.",
    };
  }
}

export async function deleteCustomerAction(
  customerId: string
): Promise<ActionState> {
  try {
    await prisma.customer.delete({ where: { id: customerId } });

    revalidatePath("/admin/customers");

    return { success: true, message: "Customer deleted successfully." };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      message: "Failed to delete customer.",
    };
  }
}
