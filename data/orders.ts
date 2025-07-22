"use server";

import prisma from "@/lib/prisma";
import { Order, OrderStatus, PaymentStatus } from "@prisma/client";
import { OrderFilters, OrderStats } from "@/lib/types";

export async function getOrderHistory(customerId: string, onlyPaid?: boolean) {
  return await prisma.order.findMany({
    where: {
      customerId,
      ...(onlyPaid && { paymentStatus: "PAID" }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrders(limit?: number): Promise<Order[]> {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    ...(limit && { take: limit }),
  });
}

export async function getOrderById(id: string, withCustomer?: boolean) {
  return prisma.order.findUnique({
    where: { id },
    ...(withCustomer && {
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
    }),
  });
}

export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  return prisma.order.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderStats(): Promise<OrderStats> {
  const [totalOrders, revenueAgg, statusCounts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const revenue = revenueAgg._sum.total || 0;
  const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  const stats = statusCounts.reduce(
    (acc: Record<string, number>, { status, _count }: any) => {
      acc[`${String(status).toLowerCase()}Orders`] = _count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalOrders,
    totalRevenue: revenue,
    averageOrderValue,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    completedOrders: 0,
    refundedOrders: 0,
    ...stats,
  };
}

export async function getOrderWithCustomer(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
        },
      },
    },
  });

  if (!order) return null;

  const items = (order.items || []).map((item: any) => ({
    productId: item.productId,

    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
    ...(item.variantId ? { variantId: item.variantId } : {}),
    ...(item.variantName ? { variantName: item.variantName } : {}),
  }));

  return {
    ...order,
    items,
    customer: order.customer
      ? {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          ...(order.customer.address
            ? { address: order.customer.address }
            : {}),
        }
      : undefined,
  };
}

export async function fetchCustomerOrdersData(filters: OrderFilters) {
  try {
    const {
      customerId,
      search,
      status,
      paymentStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      dateFrom,
      dateTo,
    } = filters;

    if (!customerId) {
      return { success: false, error: "Customer ID is required" };
    }

    const where: any = { customerId };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus.toUpperCase();
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalValue = await prisma.order.aggregate({
      _sum: { total: true },
      where,
    });

    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where,
    });

    const paymentStatusCounts = await prisma.order.groupBy({
      by: ["paymentStatus"],
      _count: true,
      where,
    });

    const statusCountMap = Object.fromEntries(
      statusCounts.map((s: any) => [s.status, s._count])
    ) as Record<Order["status"], number>;

    const paymentStatusMap = Object.fromEntries(
      paymentStatusCounts.map((s: any) => [s.paymentStatus, s._count])
    ) as Record<Order["paymentStatus"], number>;

    const averageOrderValue =
      total > 0 && totalValue._sum.total ? totalValue._sum.total / total : 0;

    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        summary: {
          totalOrders: total,
          totalValue: totalValue._sum.total || 0,
          averageOrderValue,
          statusCounts: {
            PENDING: statusCountMap["PENDING"] || 0,
            PROCESSING: statusCountMap["PROCESSING"] || 0,
            SHIPPED: statusCountMap["SHIPPED"] || 0,
            DELIVERED: statusCountMap["DELIVERED"] || 0,
            COMPLETED: statusCountMap["COMPLETED"] || 0,
            CANCELLED: statusCountMap["CANCELLED"] || 0,
            REFUNDED: statusCountMap["REFUNDED"] || 0,
          },
          paymentStatusCounts: {
            PENDING: paymentStatusMap["PENDING"] || 0,
            PAID: paymentStatusMap["PAID"] || 0,
            REFUNDED: paymentStatusMap["REFUNDED"] || 0,
            OVERDUE: paymentStatusMap["OVERDUE"] || 0,
            CANCELLED: paymentStatusMap["CANCELLED"] || 0,
          },
        },
      },
    };
  } catch (error) {
    console.error("[fetchCustomerOrdersData]", error);
    return {
      success: false,
      error: "Failed to fetch customer orders",
    };
  }
}

export async function fetchCustomersWithOrders() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
      },
    });

    return {
      success: true,
      message: "Customers with orders fetched successfully.",
      data: customers,
    };
  } catch (error) {
    console.error("Error fetching customers with orders:", error);
    return {
      success: false,
      message: "Failed to fetch customers with orders.",
    };
  }
}
