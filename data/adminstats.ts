import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import prisma from "@/lib/prisma";
import { AdminStats } from "@/lib/types";

const percentChange = (current: number, previous: number): number =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();

  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [totalProducts, totalOrders, totalCustomers, lowStock] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
    ]);

  const currentRevenueAgg = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
      paymentStatus: "PAID",
    },
  });

  // Revenue last month
  const previousRevenueAgg = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      paymentStatus: "PAID",
    },
  });

  const currentRevenue = currentRevenueAgg._sum.total || 0;
  const previousRevenue = previousRevenueAgg._sum.total || 0;

  // Orders this month vs last month
  const [currentOrders, previousOrders] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
  ]);

  // Customers this month vs last month
  const [currentCustomers, previousCustomers] = await Promise.all([
    prisma.customer.count({
      where: { joinDate: { gte: thisMonthStart, lte: thisMonthEnd } },
    }),
    prisma.customer.count({
      where: { joinDate: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
  ]);

  // Calculated growth metrics
  const revenueGrowth = percentChange(currentRevenue, previousRevenue);
  const ordersGrowth = percentChange(currentOrders, previousOrders);
  const customersGrowth = percentChange(currentCustomers, previousCustomers);

  return {
    totalProducts,
    totalOrders,
    totalRevenue: currentRevenue,
    totalCustomers,
    lowStockProducts: lowStock,

    // Mocked or external analytics
    conversionRate: 3.8, // Needs visitors data
    conversionGrowth: 0.8, // Needs previous conversion rate
    pageViews: 45678, // Use analytics API if available
    bounceRate: 42.3, // Use analytics API if available

    revenueGrowth,
    ordersGrowth,
    customersGrowth,
  };
}
