import { z } from "zod";

// Address schema for validation
const addressSchema = z.object({
  id: z.string().optional(),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .trim(),
  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(200, "Address line 1 must be less than 200 characters")
    .trim(),
  addressLine2: z
    .string()
    .max(200, "Address line 2 must be less than 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters")
    .trim(),
  state: z
    .string()
    .min(2, "State/Province must be at least 2 characters")
    .max(100, "State/Province must be less than 100 characters")
    .trim(),
  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(20, "Postal code must be less than 20 characters")
    .trim(),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be less than 100 characters")
    .trim(),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      // Enhanced phone validation for international numbers
      return /^[+]?[1-9][\d\s\-()]{7,20}$/.test(val.replace(/[\s\-()]/g, ""));
    }, "Please enter a valid phone number"),
  isDefault: z.boolean().default(false),
  preferredCourier: z
    .string()
    .max(100, "Preferred courier must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

// Base customer schema (shared fields)
const baseCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      // Enhanced phone validation for international numbers
      return /^[+]?[1-9][\d\s\-()]{7,20}$/.test(val.replace(/[\s\-()]/g, ""));
    }, "Please enter a valid phone number"),
  password: z.string(),
  status: z
    .enum(["ACTIVE", "INACTIVE"], {
      errorMap: () => ({ message: "Please select a valid status" }),
    })
    .default("ACTIVE"),
});

// Customer create schema with addresses
export const customerCreateSchema = baseCustomerSchema.extend({
  addresses: z
    .array(addressSchema)
    .min(1, "At least one address is required")
    .max(10, "Maximum 10 addresses allowed")
    .refine(
      (addresses) => {
        const defaultAddresses = addresses.filter((addr) => addr.isDefault);
        return defaultAddresses.length <= 1;
      },
      {
        message: "Only one address can be set as default",
      }
    )
    .refine(
      (addresses) => {
        if (addresses.length === 0) return true;
        return (
          addresses.some((addr) => addr.isDefault) || addresses.length === 1
        );
      },
      {
        message: "At least one address must be set as default",
      }
    ),
});

// Customer update schema with addresses
export const customerUpdateSchema = baseCustomerSchema.extend({
  addresses: z
    .array(addressSchema)
    .min(1, "At least one address is required")
    .max(10, "Maximum 10 addresses allowed")
    .refine(
      (addresses) => {
        const defaultAddresses = addresses.filter((addr) => addr.isDefault);
        return defaultAddresses.length <= 1;
      },
      {
        message: "Only one address can be set as default",
      }
    )
    .refine(
      (addresses) => {
        if (addresses.length === 0) return true;
        return addresses.some((addr) => addr.isDefault);
      },
      {
        message: "At least one address must be set as default",
      }
    ),
});

// Schema for validating individual address operations
export const addressCreateSchema = addressSchema.omit({ id: true });
export const addressUpdateSchema = addressSchema;

// Schema for bulk address operations
export const bulkAddressSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  addresses: z
    .array(addressSchema.omit({ id: true }))
    .min(1, "At least one address is required")
    .max(10, "Maximum 10 addresses allowed"),
});

// Schema for setting default address
export const setDefaultAddressSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  addressId: z.string().min(1, "Address ID is required"),
});

// Schema for deleting address
export const deleteAddressSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  addressId: z.string().min(1, "Address ID is required"),
});

// Schema for customer search/filtering
export const customerSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "all"]).default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["name", "email", "createdAt", "totalSpent"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for customer import
export const customerImportSchema = z.object({
  customers: z.array(
    baseCustomerSchema.extend({
      addresses: z.array(addressSchema.omit({ id: true })).min(1),
    })
  ),
});

// Type exports
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type AddressCreateInput = z.infer<typeof addressCreateSchema>;
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
export type BulkAddressInput = z.infer<typeof bulkAddressSchema>;
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;
export type CustomerImportInput = z.infer<typeof customerImportSchema>;

// Validation helper functions
export function validateCustomerData(
  data: unknown
): CustomerCreateInput | null {
  const result = customerCreateSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function validateAddressData(data: unknown): AddressCreateInput | null {
  const result = addressCreateSchema.safeParse(data);
  return result.success ? result.data : null;
}

// Transform functions for form data
export function transformFormDataToCustomer(
  formData: FormData
): Partial<CustomerCreateInput> {
  return {
    name: formData.get("name")?.toString(),
    email: formData.get("email")?.toString(),
    phone: formData.get("phone")?.toString() || undefined,
    password: formData.get("password")?.toString(),
    status:
      (formData.get("status")?.toString() as "ACTIVE" | "INACTIVE") || "ACTIVE",
  };
}

export function transformFormDataToAddresses(
  formData: FormData
): AddressCreateInput[] {
  const addresses: AddressCreateInput[] = [];
  let index = 0;

  while (formData.has(`addresses[${index}][fullName]`)) {
    const address: AddressCreateInput = {
      fullName: formData.get(`addresses[${index}][fullName]`)?.toString() || "",
      addressLine1:
        formData.get(`addresses[${index}][addressLine1]`)?.toString() || "",
      addressLine2:
        formData.get(`addresses[${index}][addressLine2]`)?.toString() ||
        undefined,
      city: formData.get(`addresses[${index}][city]`)?.toString() || "",
      state: formData.get(`addresses[${index}][state]`)?.toString() || "",
      postalCode:
        formData.get(`addresses[${index}][postalCode]`)?.toString() || "",
      country: formData.get(`addresses[${index}][country]`)?.toString() || "",
      phone:
        formData.get(`addresses[${index}][phone]`)?.toString() || undefined,
      isDefault: formData.get(`addresses[${index}][isDefault]`) === "true",
      preferredCourier:
        formData.get(`addresses[${index}][preferredCourier]`)?.toString() ||
        undefined,
    };

    // Only add address if required fields are present
    if (
      address.fullName &&
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.postalCode &&
      address.country
    ) {
      addresses.push(address);
    }

    index++;
  }

  // Ensure at least one address is marked as default
  if (addresses.length > 0 && !addresses.some((addr) => addr.isDefault)) {
    addresses[0].isDefault = true;
  }

  return addresses;
}

// Validation error formatter
export function formatValidationErrors(
  errors: z.ZodError
): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  errors.errors.forEach((error) => {
    const path = error.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(error.message);
  });

  return formattedErrors;
}
