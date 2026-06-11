import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalRevenue,
      totalOrders,
      activeOrders,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: { in: ['DELIVERED', 'COMPLETED'] } },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: { status: { notIn: ['CANCELLED'] } },
      }),
      this.prisma.order.count({
        where: {
          status: {
            in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'],
          },
        },
      }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    const avgOrderValue =
      totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;

    const topItems = await this.getTopItems(5);
    const revenueByDay = await this.getRevenueByDay(7);
    const ordersByStatus = await this.getOrdersByStatus();

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      activeOrders,
      totalCustomers,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      topItems,
      revenueByDay,
      ordersByStatus,
    };
  }

  async getRevenueByDay(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const byDay: Record<string, { revenue: number; orders: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      byDay[key] = { revenue: 0, orders: 0 };
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split('T')[0];
      if (byDay[key]) {
        byDay[key].revenue += order.total;
        byDay[key].orders++;
      }
    }

    return Object.entries(byDay).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));
  }

  async getTopItems(limit = 10) {
    const orderItems = await this.prisma.orderItem.groupBy({
      by: ['menuItemId', 'name'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
      where: {
        order: { status: { notIn: ['CANCELLED'] } },
      },
    });

    return orderItems.map((item: any) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      count: item._sum.quantity || 0,
      revenue: Math.round(((item._sum.price || 0) * (item._sum.quantity || 0)) * 100) / 100,
    }));
  }

  async getOrdersByStatus() {
    const statuses = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'ASSIGNED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
    ];

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.order.count({ where: { status: status as any } }),
      })),
    );

    return counts;
  }
}
