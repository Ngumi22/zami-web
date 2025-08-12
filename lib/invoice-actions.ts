"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma, Invoice, Order, PaymentStatus } from "@prisma/client";
import { requireAuth } from "./auth-action";
import { requireRateLimit } from "./ratelimit";

export type InvoiceActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createInvoiceAction(
  prevState: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const user = await requireAuth();
  if (!user) {
    throw new Error("Sign In");
  }
  await requireRateLimit({
    windowSec: 60, // 1 minute window
    max: 10, //10 uploads per minute
    identifier: user.id,
  });
  try {
    // Extract and parse data
    const invoiceNumber = formData.get("invoiceNumber") as string;
    const orderNumber = formData.get("orderNumber") as string;
    const invoiceDate = new Date(formData.get("invoiceDate") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const customer = JSON.parse(formData.get("customer") as string);
    const items = JSON.parse(formData.get("items") as string);
    const subtotal = parseFloat(formData.get("subtotal") as string);
    const tax = parseFloat(formData.get("tax") as string);
    const shipping = parseFloat((formData.get("shipping") as string) || "0");
    const discount = parseFloat((formData.get("discount") as string) || "0");
    const total = parseFloat(formData.get("total") as string);
    const notes = formData.get("notes") as string;
    const paymentTerms = formData.get("paymentTerms") as string;
    const rawPaymentStatus =
      (formData.get("paymentStatus") as string) || "PENDING";
    const paymentStatus = rawPaymentStatus.toUpperCase() as PaymentStatus;

    if (
      !invoiceNumber ||
      !orderNumber ||
      !customer ||
      !items ||
      items.length === 0
    ) {
      return {
        success: false,
        message:
          "Please fill in all required fields and add at least one item.",
        errors: { general: ["Missing required fields"] },
      };
    }

    if (dueDate <= invoiceDate) {
      return {
        success: false,
        message: "Due date must be after invoice date.",
        errors: { dueDate: ["Due date must be after invoice date"] },
      };
    }

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderNumber,
        invoiceDate,
        dueDate,
        customer,
        items,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        paymentStatus,
        paymentTerms,
        notes,
      },
    });

    revalidatePath("/admin/invoices");
    revalidatePath("/admin/customers");

    return {
      success: true,
      message: `Invoice ${invoiceNumber} created successfully!`,
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateInvoiceAction(
  invoiceId: string,
  prevState: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const user = await requireAuth();
  if (!user) {
    throw new Error("Sign In");
  }
  await requireRateLimit({
    windowSec: 60, // 1 minute window
    max: 10, //10 uploads per minute
    identifier: user.id,
  });
  try {
    const invoiceNumber = formData.get("invoiceNumber") as string;
    const orderNumber = formData.get("orderNumber") as string;
    const invoiceDate = new Date(formData.get("invoiceDate") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const customer = JSON.parse(formData.get("customer") as string);
    const items = JSON.parse(formData.get("items") as string);
    const subtotal = parseFloat(formData.get("subtotal") as string);
    const tax = parseFloat(formData.get("tax") as string);
    const shipping = parseFloat((formData.get("shipping") as string) || "0");
    const discount = parseFloat((formData.get("discount") as string) || "0");
    const total = parseFloat(formData.get("total") as string);
    const notes = formData.get("notes") as string;
    const paymentTerms = formData.get("paymentTerms") as string;
    const rawPaymentStatus =
      (formData.get("paymentStatus") as string) || "PENDING";
    const paymentStatus = rawPaymentStatus.toUpperCase() as PaymentStatus;

    if (
      !invoiceNumber ||
      !orderNumber ||
      !customer ||
      !items ||
      items.length === 0
    ) {
      return {
        success: false,
        message:
          "Please fill in all required fields and add at least one item.",
        errors: { general: ["Missing required fields"] },
      };
    }

    if (dueDate <= invoiceDate) {
      return {
        success: false,
        message: "Due date must be after invoice date.",
        errors: { dueDate: ["Due date must be after invoice date"] },
      };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber,
        orderNumber,
        invoiceDate,
        dueDate,
        customer,
        items,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        paymentStatus,
        paymentTerms,
        notes,
      },
    });

    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${invoiceId}`);
    revalidatePath("/admin/customers");

    return {
      success: true,
      message: `Invoice ${invoiceNumber} updated successfully!`,
    };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteInvoiceAction(
  invoiceId: string
): Promise<InvoiceActionState> {
  const user = await requireAuth();
  if (!user) {
    throw new Error("Sign In");
  }
  await requireRateLimit({
    windowSec: 60, // 1 minute window
    max: 10, //10 uploads per minute
    identifier: user.id,
  });
  try {
    await prisma.invoice.delete({ where: { id: invoiceId } });

    revalidatePath("/admin/invoices");

    return {
      success: true,
      message: "Invoice deleted successfully.",
    };
  } catch (error) {
    console.error("Delete invoice error:", error);
    return {
      success: false,
      message: "Failed to delete invoice.",
    };
  }
}

export async function createInvoiceFromOrder(order: Order): Promise<Invoice> {
  const user = await requireAuth();
  if (!user) {
    throw new Error("Sign In");
  }
  await requireRateLimit({
    windowSec: 60, // 1 minute window
    max: 10, //10 uploads per minute
    identifier: user.id,
  });
  const invoiceDate = order.completedAt || order.createdAt;
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);

  let status: PaymentStatus = "PENDING";
  if (order.paymentStatus === "PAID") {
    status = "PAID";
  } else if (new Date() > dueDate) {
    status = "OVERDUE";
  }

  const invoiceData: Prisma.InvoiceCreateInput = {
    invoiceNumber: `INV-${order.orderNumber.replace("ORD-", "")}`,
    orderNumber: order.orderNumber,
    customer: {
      id: order.customerId,
      name: order.customerName,
      email: order.customerEmail,
      address: `${order.shippingAddress.addressLine1}${
        order.shippingAddress.addressLine2
          ? `, ${order.shippingAddress.addressLine2}`
          : ""
      }, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
        order.shippingAddress.postalCode
      }`,
      phone: order.shippingAddress.phone ?? "",
    },
    items: order.items.map((item) => ({
      description: `${item.productName}${
        item.variantName ? ` - ${item.variantName}` : ""
      }`,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.total,
      sku: item.sku ?? "",
    })),
    invoiceDate,
    dueDate,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    paymentStatus: status,
    paymentTerms: "Payment due within 30 days",
    notes: order.notes,
  };

  return prisma.invoice.create({
    data: invoiceData,
  });
}
