import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { AssignDeliveryDto, ConfirmDeliveryDto } from './dto/delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  async getDriverAssignments(driverId: string) {
    return this.prisma.delivery.findMany({
      where: {
        driverId,
        status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] },
      },
      include: {
        order: {
          include: {
            items: true,
            address: true,
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeliveryById(id: string, driverId?: string) {
    const where: any = { id };
    if (driverId) where.driverId = driverId;

    const delivery = await this.prisma.delivery.findFirst({
      where,
      include: {
        order: {
          include: {
            items: true,
            address: true,
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        driver: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async confirmPickup(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, driverId },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.status !== 'ASSIGNED') {
      throw new BadRequestException('Delivery is not in ASSIGNED status');
    }

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'PICKED_UP',
          pickedUpAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: 'OUT_FOR_DELIVERY' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          status: 'OUT_FOR_DELIVERY',
          changedBy: driverId,
          note: 'Order picked up by driver',
        },
      });

      await tx.notification.create({
        data: {
          userId: delivery.order.userId,
          title: 'Order Out for Delivery',
          body: `Your order #${delivery.order.orderNumber} is on the way!`,
          type: 'DELIVERY_UPDATE',
          data: { orderId: delivery.orderId },
        },
      });

      return updatedDelivery;
    });

    this.gateway.emitOrderStatusUpdate(
      delivery.orderId,
      'OUT_FOR_DELIVERY',
      delivery.order.userId,
    );
    return updated;
  }

  async confirmDelivery(
    deliveryId: string,
    driverId: string,
    dto: ConfirmDeliveryDto,
  ) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId, driverId },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (!['PICKED_UP', 'IN_TRANSIT'].includes(delivery.status)) {
      throw new BadRequestException('Order must be picked up before marking as delivered');
    }

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          codCollected: dto.codCollected,
          notes: dto.notes,
        },
      });

      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: 'DELIVERED',
          ...(dto.codCollected !== undefined && {
            paymentStatus: 'PAID',
          }),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          status: 'DELIVERED',
          changedBy: driverId,
          note: 'Order delivered successfully',
        },
      });

      await tx.notification.create({
        data: {
          userId: delivery.order.userId,
          title: 'Order Delivered',
          body: `Your order #${delivery.order.orderNumber} has been delivered. Enjoy your meal!`,
          type: 'DELIVERY_UPDATE',
          data: { orderId: delivery.orderId },
        },
      });

      return updatedDelivery;
    });

    this.gateway.emitOrderStatusUpdate(
      delivery.orderId,
      'DELIVERED',
      delivery.order.userId,
    );
    return updated;
  }

  async getDriverHistory(driverId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [deliveries, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where: { driverId, status: 'DELIVERED' },
        include: {
          order: {
            include: {
              address: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { deliveredAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.delivery.count({
        where: { driverId, status: 'DELIVERED' },
      }),
    ]);

    return {
      deliveries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async assignDelivery(dto: AssignDeliveryDto, assignedBy: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!['READY', 'ASSIGNED'].includes(order.status)) {
      throw new BadRequestException('Order must be READY before assigning delivery');
    }

    const driver = await this.prisma.user.findFirst({
      where: { id: dto.driverId, role: 'DELIVERY', isActive: true },
    });
    if (!driver) throw new NotFoundException('Driver not found or inactive');

    const delivery = await this.prisma.$transaction(async (tx: any) => {
      const existingDelivery = await tx.delivery.findFirst({
        where: { orderId: dto.orderId },
      });

      let newDelivery;
      if (existingDelivery) {
        newDelivery = await tx.delivery.update({
          where: { id: existingDelivery.id },
          data: { driverId: dto.driverId, status: 'ASSIGNED' },
          include: { order: true, driver: { select: { id: true, name: true, phone: true } } },
        });
      } else {
        newDelivery = await tx.delivery.create({
          data: {
            orderId: dto.orderId,
            driverId: dto.driverId,
            status: 'ASSIGNED',
          },
          include: { order: true, driver: { select: { id: true, name: true, phone: true } } },
        });
      }

      await tx.order.update({
        where: { id: dto.orderId },
        data: { status: 'ASSIGNED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: dto.orderId,
          status: 'ASSIGNED',
          changedBy: assignedBy,
          note: `Assigned to driver ${driver.name}`,
        },
      });

      return newDelivery;
    });

    this.gateway.emitOrderStatusUpdate(dto.orderId, 'ASSIGNED', order.userId);
    this.gateway.emitDeliveryUpdate(delivery.id, { status: 'ASSIGNED', orderId: dto.orderId });

    return delivery;
  }

  async getAvailableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: 'READY',
        delivery: null,
      },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async acceptDelivery(orderId: string, driverId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'READY') {
      throw new BadRequestException('Order is not ready for delivery');
    }

    const driver = await this.prisma.user.findFirst({
      where: { id: driverId, role: 'DELIVERY', isActive: true },
    });
    if (!driver) throw new NotFoundException('Driver not found or inactive');

    const delivery = await this.prisma.$transaction(async (tx: any) => {
      const existingDelivery = await tx.delivery.findFirst({
        where: { orderId },
      });

      let newDelivery;
      if (existingDelivery) {
        newDelivery = await tx.delivery.update({
          where: { id: existingDelivery.id },
          data: { driverId, status: 'ASSIGNED' },
          include: { order: true, driver: { select: { id: true, name: true, phone: true } } },
        });
      } else {
        newDelivery = await tx.delivery.create({
          data: {
            orderId,
            driverId,
            status: 'ASSIGNED',
          },
          include: { order: true, driver: { select: { id: true, name: true, phone: true } } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'ASSIGNED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'ASSIGNED',
          changedBy: driverId,
          note: `Accepted by driver ${driver.name}`,
        },
      });

      return newDelivery;
    });

    this.gateway.emitOrderStatusUpdate(orderId, 'ASSIGNED', order.userId);
    this.gateway.emitDeliveryUpdate(delivery.id, { status: 'ASSIGNED', orderId });

    return delivery;
  }
}
