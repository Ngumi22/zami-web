import {
  Customer,
  Order,
  Prisma,
  CustomerStatus,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";

export type CustomerFilters = {
  search?: string;
  status?: CustomerStatus | "all";
  sortBy?: "name" | "email" | "joinDate" | "totalSpent" | "orderCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type CustomersResponse = {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: CustomerFilters;
};

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getAllCustomers(
  filters: CustomerFilters = {}
): Promise<ActionResult<CustomersResponse>> {
  try {
    const {
      search = "",
      status = "all",
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 10,
      dateFrom,
      dateTo,
    } = filters;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { equals: search } },
        { phone: { contains: search } },
      ];
    }

    if (status !== "all") {
      where.status = status;
    }

    if (dateFrom) {
      where.joinDate = {
        ...(typeof where.joinDate === "object" && where.joinDate !== null
          ? where.joinDate
          : {}),
        gte: new Date(dateFrom),
      };
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.joinDate = {
        ...(typeof where.joinDate === "object" && where.joinDate !== null
          ? where.joinDate
          : {}),
        lte: toDate,
      };
    }

    const total = await prisma.customer.count({ where });

    const orderBy: Prisma.CustomerOrderByWithRelationInput =
      sortBy === "orderCount"
        ? { orders: { _count: sortOrder } }
        : { [sortBy]: sortOrder };

    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { orders: true },
        },
        addresses: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    const response: CustomersResponse = {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      success: false,
      error: "Failed to fetch customers. Please try again.",
    };
  }
}

export async function getCustomerStats(): Promise<
  ActionResult<{
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    totalRevenue: number;
    averageOrderValue: number;
    topCustomers: Array<{
      id: string;
      name: string;
      email: string;
      totalSpent: number;
      orderCount: number;
    }>;
  }>
> {
  try {
    const totalCustomers = await prisma.customer.count();
    const activeCustomers = await prisma.customer.count({
      where: { status: "ACTIVE" },
    });
    const inactiveCustomers = await prisma.customer.count({
      where: { status: "INACTIVE" },
    });

    const revenueData = await prisma.customer.aggregate({
      _sum: { totalSpent: true },
    });
    const totalRevenue = revenueData._sum.totalSpent ?? 0;

    const orderData = await prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
    });
    const totalOrders = orderData._count.id;
    const averageOrderValue =
      totalOrders > 0 ? (orderData._sum.total ?? 0) / totalOrders : 0;

    const topCustomersData = await prisma.customer.findMany({
      orderBy: { totalSpent: "desc" },
      take: 5,
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    const topCustomers = topCustomersData.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      totalSpent: c.totalSpent,
      orderCount: c._count.orders,
    }));

    return {
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        totalRevenue,
        averageOrderValue,
        topCustomers,
      },
    };
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return {
      success: false,
      error: "Failed to fetch customer statistics. Please try again.",
    };
  }
}

export async function searchCustomers(
  query: string
): Promise<ActionResult<Customer[]>> {
  try {
    const result = await getAllCustomers({
      search: query,
      limit: 50,
    });

    if (!result.success || !result.data) {
      throw new Error("Search failed");
    }

    return {
      success: true,
      data: result.data.customers,
    };
  } catch (error) {
    console.error("Error searching customers:", error);
    return {
      success: false,
      error: "Search failed. Please try again.",
    };
  }
}

export async function updateCustomerStatus(
  customerId: string,
  status: CustomerStatus
): Promise<ActionResult<{ message: string }>> {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { status },
    });

    return {
      success: true,
      data: {
        message: `Customer status updated to ${status} successfully`,
      },
    };
  } catch (error) {
    console.error("Error updating customer status:", error);
    return {
      success: false,
      error: "Failed to update customer status. Please try again.",
    };
  }
}

export function getOrderStatusColor(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getPaymentStatusColor(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export async function getCustomerWithOrders(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: { addresses: true, orders: true },
  });
}

export async function getCustomersAndOrders() {
  return prisma.customer.findMany({
    include: {
      addresses: true,
      orders: true,
    },
  });
}

export async function getOrdersAndCustomers() {
  return prisma.order.findMany({
    include: { customer: true },
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: true,
    },
  });
}

export async function getCustomers() {
  return prisma.customer.findMany({ orderBy: { joinDate: "desc" } });
}

export async function getCustomerWithAddressesAndCart(customerId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        cart: true,
      },
    });

    return customer;
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    throw new Error("Could not load customer data");
  }
}

export async function getCustomerOrdersWithItems(customerId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("Could not load customer orders");
  }
}
