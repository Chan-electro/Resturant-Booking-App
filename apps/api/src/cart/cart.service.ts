import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              menuItem: {
                include: { category: true },
              },
            },
          },
        },
      });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0,
    );

    return { ...cart, total };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: dto.menuItemId },
    });
    if (!menuItem || !menuItem.isActive) {
      throw new NotFoundException('Menu item not found or unavailable');
    }

    let cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, menuItemId: dto.menuItemId },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: dto.menuItemId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, menuItemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, menuItemId },
    });
    if (!item) throw new NotFoundException('Item not in cart');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: dto.quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, menuItemId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, menuItemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared' };
  }
}
