"use server";

import prisma from "@/lib/prisma";
import { Invoice, Order, PaymentStatus, Prisma } from "@prisma/client";

export type InvoiceFilters = {
  search?: string;
  paymentStatus?: "paid" | "pending" | "overdue" | "all";
  customerId?: string;
  sortBy?: "invoiceDate" | "dueDate" | "total" | "invoiceNumber";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type InvoicesResponse = {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: InvoiceFilters;
  summary: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    statusCounts: Record<string, number>;
  };
};

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  try {
    return await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
  } catch (error) {
    console.error(`Error fetching invoice ${invoiceId}:`, error);
    return null;
  }
}

export async function getInvoiceByOrderNumber(
  orderNumber: string
): Promise<Invoice | null> {
  try {
    return await prisma.invoice.findUnique({
      where: { orderNumber: orderNumber },
    });
  } catch (error) {
    console.error(`Error fetching invoice for order ${orderNumber}:`, error);
    return null;
  }
}

export async function getAllInvoices(
  filters: InvoiceFilters = {}
): Promise<ActionResult<InvoicesResponse>> {
  try {
    const {
      search = "",
      paymentStatus = "all",
      customerId,
      sortBy = "invoiceDate",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      dateFrom,
      dateTo,
    } = filters;

    const where: Prisma.InvoiceWhereInput = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          customer: { is: { name: { contains: search, mode: "insensitive" } } },
        },
        {
          customer: {
            is: { email: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }
    if (customerId) {
      where.customer = { is: { id: customerId } };
    }
    if (paymentStatus !== "all") {
      where.paymentStatus = paymentStatus.toUpperCase() as PaymentStatus;
    }
    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
      if (dateTo) where.invoiceDate.lte = new Date(dateTo);
    }

    const orderBy = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;
    const take = limit;

    type SummaryGroup = {
      paymentStatus: string;
      createdAt: Date;
      _sum: { total: number | null };
      _count: { _all: number | null };
    };

    const [invoices, totalInvoices, summaryGroups] = (await prisma.$transaction(
      [
        prisma.invoice.findMany({ where, orderBy, skip, take }),
        prisma.invoice.count({ where }),
        prisma.invoice.groupBy({
          by: ["paymentStatus", "createdAt"],
          _sum: { total: true },
          _count: { _all: true },
          where,
          orderBy: { createdAt: "desc" },
        }),
      ]
    )) as [Invoice[], number, SummaryGroup[]];

    let totalAmount = 0;
    const statusCounts: Record<string, number> = {
      PAID: 0,
      PENDING: 0,
      OVERDUE: 0,
    };
    const statusAmounts: Record<string, number> = {
      PAID: 0,
      PENDING: 0,
      OVERDUE: 0,
    };

    for (const group of summaryGroups) {
      const sum = group._sum?.total ?? 0;
      const count =
        typeof group._count === "object" &&
        group._count !== null &&
        "_all" in group._count
          ? group._count._all ?? 0
          : 0;
      totalAmount += sum;
      if (group.paymentStatus in statusCounts) {
        statusCounts[group.paymentStatus] = count;
        statusAmounts[group.paymentStatus] = sum;
      }
    }

    const totalPages = Math.ceil(totalInvoices / limit);
    const response: InvoicesResponse = {
      invoices,
      pagination: {
        page,
        limit,
        total: totalInvoices,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters,
      summary: {
        totalInvoices,
        totalAmount,
        paidAmount: statusAmounts.PAID,
        pendingAmount: statusAmounts.PENDING,
        overdueAmount: statusAmounts.OVERDUE,
        statusCounts: {
          paid: statusCounts.PAID,
          pending: statusCounts.PENDING,
          overdue: statusCounts.OVERDUE,
        },
      },
    };

    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { success: false, error: "Failed to fetch invoices." };
  }
}

export async function getInvoiceStats(): Promise<
  ActionResult<{
    totalInvoices: number;
    totalRevenue: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    averageInvoiceValue: number;
    monthlyRevenue: number;
    recentInvoices: Invoice[];
  }>
> {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [globalStats, statusGroups, monthlyRevenueResult, recentInvoices] =
      (await prisma.$transaction([
        prisma.invoice.aggregate({
          _count: { _all: true },
          _sum: { total: true },
        }),
        prisma.invoice.groupBy({
          by: ["paymentStatus"],
          _count: { _all: true },
          orderBy: { paymentStatus: "asc" },
        }),
        prisma.invoice.aggregate({
          where: {
            paymentStatus: "PAID",
            invoiceDate: { gte: firstDayOfMonth },
          },
          _sum: { total: true },
        }),
        prisma.invoice.findMany({
          orderBy: { invoiceDate: "desc" },
          take: 5,
        }),
      ])) as [
        { _count: { _all: number }; _sum: { total: number } },
        { paymentStatus: string; _count: { _all?: number } }[],
        { _sum: { total: number } },
        Invoice[]
      ];

    const totalInvoices = globalStats._count?._all ?? 0;
    const totalRevenue = globalStats._sum?.total ?? 0;
    const monthlyRevenue = monthlyRevenueResult._sum?.total ?? 0;

    const counts = statusGroups.reduce(
      (
        acc: Record<string, number>,
        group: { paymentStatus: string; _count: { _all?: number } }
      ) => {
        acc[group.paymentStatus] =
          typeof group._count === "object" &&
          group._count !== null &&
          "_all" in group._count
            ? group._count._all ?? 0
            : 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageInvoiceValue =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      success: true,
      data: {
        totalInvoices,
        totalRevenue,
        paidInvoices: counts["PAID"] ?? 0,
        pendingInvoices: counts["PENDING"] ?? 0,
        overdueInvoices: counts["OVERDUE"] ?? 0,
        averageInvoiceValue,
        monthlyRevenue,
        recentInvoices,
      },
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return { success: false, error: "Failed to fetch invoice statistics." };
  }
}

export async function searchInvoices(
  query: string
): Promise<ActionResult<Invoice[]>> {
  try {
    if (!query) {
      return { success: true, data: [] };
    }
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: query, mode: "insensitive" } },
          { orderNumber: { contains: query, mode: "insensitive" } },
          {
            customer: {
              is: { name: { contains: query, mode: "insensitive" } },
            },
          },
          {
            customer: {
              is: { email: { contains: query, mode: "insensitive" } },
            },
          },
        ],
      },
      take: 50,
      orderBy: { invoiceDate: "desc" },
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error("Error searching invoices:", error);
    return { success: false, error: "Search failed. Please try again." };
  }
}

export async function getCustomerInvoices(
  customerId: string
): Promise<ActionResult<Invoice[]>> {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { customer: { is: { id: customerId } } },
      take: 200,
      orderBy: { invoiceDate: "desc" },
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    return { success: false, error: "Failed to fetch customer invoices." };
  }
}
