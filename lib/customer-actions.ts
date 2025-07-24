"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  customerCreateSchema,
  customerUpdateSchema,
  setDefaultAddressSchema,
  deleteAddressSchema,
  transformFormDataToCustomer,
  transformFormDataToAddresses,
  formatValidationErrors,
  type CustomerCreateInput,
  type CustomerUpdateInput,
} from "./customer-schemas";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

interface AddressData {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  preferredCourier?: string;
}

export async function createCustomerAction(
  formData: FormData
): Promise<ActionState> {
  try {
    // Transform form data
    const customerData = transformFormDataToCustomer(formData);
    const addresses = transformFormDataToAddresses(formData);

    // Combine customer and address data for validation
    const fullCustomerData: CustomerCreateInput = {
      ...customerData,
      addresses,
    } as CustomerCreateInput;

    // Validate the complete data
    const validated = customerCreateSchema.safeParse(fullCustomerData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed. Please check your inputs.",
        errors: formatValidationErrors(validated.error),
      };
    }

    const { addresses: validatedAddresses, ...validatedCustomer } =
      validated.data;

    // Create customer with addresses in a transaction
    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: validatedCustomer,
      });

      // Create addresses
      if (validatedAddresses && validatedAddresses.length > 0) {
        await tx.customerAddress.createMany({
          data: validatedAddresses.map((address) => ({
            customerId: customer.id,
            fullName: address.fullName,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || null,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone || null,
            isDefault: address.isDefault,
            preferredCourier: address.preferredCourier || null,
          })),
        });
      }
    });

    revalidatePath("/admin/customers");
    return { success: true, message: "Customer created successfully." };
  } catch (error) {
    console.error("Create customer error:", error);
    return {
      success: false,
      message: "Failed to create customer. Please try again.",
    };
  }
}

export async function updateCustomerAction(
  customerId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Transform form data
    const customerData = transformFormDataToCustomer(formData);
    const addresses = transformFormDataToAddresses(formData);

    // Add existing address IDs from form data
    const addressesWithIds = addresses.map((address, index) => {
      const id = formData.get(`addresses[${index}][id]`)?.toString();
      return id ? { ...address, id } : address;
    });

    // Combine customer and address data for validation
    const fullCustomerData: CustomerUpdateInput = {
      ...customerData,
      addresses: addressesWithIds,
    } as CustomerUpdateInput;

    // Validate the complete data
    const validated = customerUpdateSchema.safeParse(fullCustomerData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed. Please check your inputs.",
        errors: formatValidationErrors(validated.error),
      };
    }

    const { addresses: validatedAddresses, ...validatedCustomer } =
      validated.data;

    // Update customer and addresses in a transaction
    await prisma.$transaction(async (tx) => {
      // Update customer basic info
      await tx.customer.update({
        where: { id: customerId },
        data: validatedCustomer,
      });

      // Get existing addresses
      const existingAddresses = await tx.customerAddress.findMany({
        where: { customerId },
      });

      // Separate new addresses from existing ones
      const existingAddressIds = new Set(
        existingAddresses.map((addr) => addr.id)
      );
      const updatedAddressIds = new Set(
        validatedAddresses.filter((addr) => addr.id).map((addr) => addr.id!)
      );

      // Delete addresses that are no longer present
      const addressesToDelete = existingAddresses.filter(
        (addr) => !updatedAddressIds.has(addr.id)
      );
      if (addressesToDelete.length > 0) {
        await tx.customerAddress.deleteMany({
          where: {
            id: { in: addressesToDelete.map((addr) => addr.id) },
          },
        });
      }

      // Process each validated address
      for (const address of validatedAddresses) {
        const addressData = {
          fullName: address.fullName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || null,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone || null,
          isDefault: address.isDefault,
          preferredCourier: address.preferredCourier || null,
        };

        if (address.id && existingAddressIds.has(address.id)) {
          // Update existing address
          await tx.customerAddress.update({
            where: { id: address.id },
            data: addressData,
          });
        } else {
          // Create new address
          await tx.customerAddress.create({
            data: {
              customerId,
              ...addressData,
            },
          });
        }
      }

      // Ensure only one default address exists (database constraint)
      const defaultAddresses = await tx.customerAddress.findMany({
        where: { customerId, isDefault: true },
      });

      if (defaultAddresses.length > 1) {
        // Keep the first default, unset others
        const addressesToUpdate = defaultAddresses.slice(1);
        await tx.customerAddress.updateMany({
          where: {
            id: { in: addressesToUpdate.map((addr) => addr.id) },
          },
          data: { isDefault: false },
        });
      }

      // If no default address, set the first one as default
      if (defaultAddresses.length === 0) {
        const firstAddress = await tx.customerAddress.findFirst({
          where: { customerId },
        });
        if (firstAddress) {
          await tx.customerAddress.update({
            where: { id: firstAddress.id },
            data: { isDefault: true },
          });
        }
      }
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
      message: "Failed to update customer. Please try again.",
    };
  }
}

export async function deleteCustomerAction(
  customerId: string
): Promise<ActionState> {
  try {
    // Validate customer ID
    if (!customerId || customerId.trim() === "") {
      return {
        success: false,
        message: "Invalid customer ID.",
      };
    }

    // Check if customer exists and has orders
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: { take: 1 }, // Just check if any orders exist
      },
    });

    if (!customer) {
      return {
        success: false,
        message: "Customer not found.",
      };
    }

    // Prevent deletion if customer has orders (business rule)
    if (customer.orders && customer.orders.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete customer with existing orders. Please archive the customer instead.",
      };
    }

    // Delete customer and related addresses in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all customer addresses first
      await tx.customerAddress.deleteMany({
        where: { customerId },
      });

      // Then delete the customer
      await tx.customer.delete({
        where: { id: customerId },
      });
    });

    revalidatePath("/admin/customers");
    return { success: true, message: "Customer deleted successfully." };
  } catch (error) {
    console.error("Delete customer error:", error);
    return {
      success: false,
      message: "Failed to delete customer. Please try again.",
    };
  }
}

export async function deleteCustomerAddressAction(
  customerId: string,
  addressId: string
): Promise<ActionState> {
  try {
    // Validate input data
    const validated = deleteAddressSchema.safeParse({ customerId, addressId });

    if (!validated.success) {
      return {
        success: false,
        message: "Invalid input data.",
        errors: formatValidationErrors(validated.error),
      };
    }

    await prisma.$transaction(async (tx) => {
      // Check if this is the address to delete
      const addressToDelete = await tx.customerAddress.findUnique({
        where: { id: addressId },
        include: { customer: true },
      });

      if (!addressToDelete) {
        throw new Error("Address not found");
      }

      if (addressToDelete.customerId !== customerId) {
        throw new Error("Address does not belong to this customer");
      }

      // Check if customer has other addresses
      const otherAddresses = await tx.customerAddress.findMany({
        where: {
          customerId,
          id: { not: addressId },
        },
      });

      if (otherAddresses.length === 0) {
        throw new Error(
          "Cannot delete the last address. Customer must have at least one address."
        );
      }

      // Delete the address
      await tx.customerAddress.delete({
        where: { id: addressId },
      });

      // If we deleted the default address, make another one default
      if (addressToDelete.isDefault && otherAddresses.length > 0) {
        await tx.customerAddress.update({
          where: { id: otherAddresses[0].id },
          data: { isDefault: true },
        });
      }
    });

    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath("/admin/customers");
    return { success: true, message: "Address deleted successfully." };
  } catch (error) {
    console.error("Delete address error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete address.",
    };
  }
}

export async function setDefaultAddressAction(
  customerId: string,
  addressId: string
): Promise<ActionState> {
  try {
    // Validate input data
    const validated = setDefaultAddressSchema.safeParse({
      customerId,
      addressId,
    });

    if (!validated.success) {
      return {
        success: false,
        message: "Invalid input data.",
        errors: formatValidationErrors(validated.error),
      };
    }

    await prisma.$transaction(async (tx) => {
      // Verify the address belongs to the customer
      const address = await tx.customerAddress.findUnique({
        where: { id: addressId },
      });

      if (!address) {
        throw new Error("Address not found");
      }

      if (address.customerId !== customerId) {
        throw new Error("Address does not belong to this customer");
      }

      // Unset all default addresses for this customer
      await tx.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });

      // Set the specified address as default
      await tx.customerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });

    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath("/admin/customers");
    return { success: true, message: "Default address updated successfully." };
  } catch (error) {
    console.error("Set default address error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update default address.",
    };
  }
}

// Additional action for archiving customers (instead of deleting)
export async function archiveCustomerAction(
  customerId: string
): Promise<ActionState> {
  try {
    if (!customerId || customerId.trim() === "") {
      return {
        success: false,
        message: "Invalid customer ID.",
      };
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return {
        success: false,
        message: "Customer not found.",
      };
    }

    // Update customer status to inactive
    await prisma.customer.update({
      where: { id: customerId },
      data: { status: "INACTIVE" },
    });

    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath("/admin/customers");
    return { success: true, message: "Customer archived successfully." };
  } catch (error) {
    console.error("Archive customer error:", error);
    return {
      success: false,
      message: "Failed to archive customer. Please try again.",
    };
  }
}

// Action for bulk address operations
export async function bulkUpdateAddressesAction(
  customerId: string,
  addresses: Array<{
    id?: string;
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    preferredCourier?: string;
  }>
): Promise<ActionState> {
  try {
    // Validate addresses using the schema
    const validated = customerUpdateSchema
      .pick({ addresses: true })
      .safeParse({ addresses });

    if (!validated.success) {
      return {
        success: false,
        message: "Address validation failed.",
        errors: formatValidationErrors(validated.error),
      };
    }

    await prisma.$transaction(async (tx) => {
      // Get existing addresses
      const existingAddresses = await tx.customerAddress.findMany({
        where: { customerId },
      });

      const existingIds = new Set(existingAddresses.map((addr) => addr.id));
      const updatedIds = new Set(
        addresses.filter((addr) => addr.id).map((addr) => addr.id!)
      );

      // Delete removed addresses
      const toDelete = existingAddresses.filter(
        (addr) => !updatedIds.has(addr.id)
      );
      if (toDelete.length > 0) {
        await tx.customerAddress.deleteMany({
          where: { id: { in: toDelete.map((addr) => addr.id) } },
        });
      }

      // Update or create addresses
      for (const address of addresses) {
        const addressData = {
          fullName: address.fullName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || null,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone || null,
          isDefault: address.isDefault,
          preferredCourier: address.preferredCourier || null,
        };

        if (address.id && existingIds.has(address.id)) {
          await tx.customerAddress.update({
            where: { id: address.id },
            data: addressData,
          });
        } else {
          await tx.customerAddress.create({
            data: { customerId, ...addressData },
          });
        }
      }
    });

    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true, message: "Addresses updated successfully." };
  } catch (error) {
    console.error("Bulk update addresses error:", error);
    return {
      success: false,
      message: "Failed to update addresses. Please try again.",
    };
  }
}
