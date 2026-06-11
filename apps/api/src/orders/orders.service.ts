import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { PlaceOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  async placeOrder(userId: string, dto: PlaceOrderDto) {
    // Check cutoff time (9 PM)
    const now = new Date();
    const cutoffHour = 21; // 9 PM
    if (now.getHours() >= cutoffHour) {
      throw new BadRequestException(
        'Orders cannot be placed after 9:00 PM. Please order before 9 PM for next day delivery.',
      );
    }

    // Validate address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Validate delivery date
    const deliveryDate = new Date(dto.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate <= today) {
      throw new BadRequestException('Delivery date must be in the future');
    }

    // Validate items and check daily menu availability
    const orderItemsData: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string | null;
    }> = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!menuItem || !menuItem.isActive) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found`);
      }

      const dailyMenu = await this.prisma.dailyMenu.findFirst({
        where: {
          menuItemId: item.menuItemId,
          date: deliveryDate,
          isAvailable: true,
        },
      });

      if (!dailyMenu) {
        throw new BadRequestException(
          `${menuItem.name} is not available on the selected date`,
        );
      }

      if (dailyMenu.remainingQty < item.quantity) {
        throw new BadRequestException(
          `Only ${dailyMenu.remainingQty} units of ${menuItem.name} remaining`,
        );
      }

      orderItemsData.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        imageUrl: menuItem.imageUrl,
      });

      subtotal += menuItem.price * item.quantity;
    }

    // Get settings for tax and delivery fee
    const [taxSetting, deliveryFeeSetting, freeDeliveryMinSetting] =
      await Promise.all([
        this.prisma.setting.findUnique({ where: { key: 'tax_rate' } }),
        this.prisma.setting.findUnique({ where: { key: 'delivery_fee' } }),
        this.prisma.setting.findUnique({ where: { key: 'free_delivery_minimum' } }),
      ]);

    const taxRate = parseFloat(taxSetting?.value || '5') / 100;
    const deliveryFeeBase = parseFloat(deliveryFeeSetting?.value || '0');
    const freeDeliveryMin = parseFloat(freeDeliveryMinSetting?.value || '200');

    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const deliveryFee = subtotal >= freeDeliveryMin ? 0 : deliveryFeeBase;

    // Apply coupon if provided
    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: dto.couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });
      if (coupon && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrder) {
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = coupon.value;
        }
        discount = Math.round(discount * 100) / 100;
      }
    }

    const total = Math.max(0, subtotal + tax + deliveryFee - discount);

    // Generate unique order number
    const orderNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: dto.addressId,
          orderNumber,
          subtotal,
          tax,
          deliveryFee,
          discount,
          total,
          paymentMethod: (dto.paymentMethod as any) || 'COD',
          deliveryDate,
          specialInstructions: dto.specialInstructions,
          couponCode: dto.couponCode,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: 'PLACED',
              changedBy: userId,
              note: 'Order placed by customer',
            },
          },
        },
        include: {
          items: true,
          address: true,
          statusHistory: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      // Decrement remaining quantities
      for (const item of dto.items) {
        await tx.dailyMenu.updateMany({
          where: {
            menuItemId: item.menuItemId,
            date: deliveryDate,
          },
          data: { remainingQty: { decrement: item.quantity } },
        });
      }

      // Update coupon usage
      if (dto.couponCode && discount > 0) {
        await tx.coupon.updateMany({
          where: { code: dto.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear user cart
      const cart = await tx.cart.findFirst({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // Create order confirmation notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Order Placed Successfully',
          body: `Your order #${orderNumber} has been placed and will be delivered on ${deliveryDate.toDateString()}.`,
          type: 'ORDER_CONFIRMATION',
          data: { orderId: newOrder.id, orderNumber },
        },
      });

      return newOrder;
    });

    // Emit WebSocket event to kitchen
    this.gateway.emitNewOrder(order);
    this.gateway.emitNotification(userId, {
      title: 'Order Placed',
      body: `Order #${orderNumber} confirmed`,
    });

    return order;
  }

  async getOrders(
    userId: string,
    page = 1,
    pageSize = 10,
    status?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
          delivery: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOrderById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: true,
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        delivery: { include: { driver: { select: { id: true, name: true, phone: true } } } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException(
        'Order cannot be cancelled at this stage',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CANCELLED',
          changedBy: userId,
          note: 'Cancelled by customer',
        },
      });

      // Restore daily menu quantities
      const orderItems = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of orderItems) {
        await tx.dailyMenu.updateMany({
          where: {
            menuItemId: item.menuItemId,
            date: order.deliveryDate,
          },
          data: { remainingQty: { increment: item.quantity } },
        });
      }

      await tx.notification.create({
        data: {
          userId,
          title: 'Order Cancelled',
          body: `Your order #${order.orderNumber} has been cancelled.`,
          type: 'ORDER_STATUS',
          data: { orderId, orderNumber: order.orderNumber },
        },
      });

      return updatedOrder;
    });

    this.gateway.emitOrderStatusUpdate(orderId, 'CANCELLED', userId);
    return updated;
  }

  async getAllOrders(
    page = 1,
    pageSize = 20,
    status?: string,
    date?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      where.deliveryDate = d;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
          delivery: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    changedBy: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status as any },
        include: { user: { select: { id: true } } },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status as any,
          changedBy,
          note: dto.note,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Status Updated',
          body: `Your order #${order.orderNumber} is now ${dto.status.replace(/_/g, ' ').toLowerCase()}.`,
          type: 'ORDER_STATUS',
          data: { orderId, status: dto.status, orderNumber: order.orderNumber },
        },
      });

      return updatedOrder;
    });

    this.gateway.emitOrderStatusUpdate(orderId, dto.status, order.userId);
    return updated;
  }

  async getKitchenQueue() {
    return this.prisma.order.findMany({
      where: {
        status: { in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] },
      },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProductionSummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await this.prisma.order.findMany({
      where: {
        deliveryDate: targetDate,
        status: { notIn: ['CANCELLED'] },
      },
      include: { items: true },
    });

    // Aggregate by menu item
    const summary: Record<string, { name: string; total: number; imageUrl?: string }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!summary[item.menuItemId]) {
          summary[item.menuItemId] = {
            name: item.name,
            total: 0,
            imageUrl: item.imageUrl || undefined,
          };
        }
        summary[item.menuItemId].total += item.quantity;
      }
    }

    return {
      date: targetDate.toISOString().split('T')[0],
      totalOrders: orders.length,
      items: Object.entries(summary).map(([menuItemId, data]) => ({
        menuItemId,
        ...data,
      })),
    };
  }
}
