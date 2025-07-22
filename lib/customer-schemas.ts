import { z } from "zod";

export const customerCreateSchema = z.object({
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
      return /^[+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-]/g, ""));
    }, "Please enter a valid phone number"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const customerUpdateSchema = z.object({
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
      // Basic phone validation - adjust regex based on your requirements
      return /^[+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-$$$$]/g, ""));
    }, "Please enter a valid phone number"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
