import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  CreateCouponDto,
  UpdateCouponDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== USERS =====================

  async getAllUsers(page = 1, pageSize = 20, role?: string, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
        addresses: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role as any },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  // ===================== COUPONS =====================

  async getCoupons(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.coupon.count(),
    ]);

    return { coupons, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createCoupon(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type as any,
        value: dto.value,
        minOrder: dto.minOrder ?? 0,
        maxDiscount: dto.maxDiscount,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        usageLimit: dto.usageLimit ?? 100,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.type && { type: dto.type as any }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.minOrder !== undefined && { minOrder: dto.minOrder }),
        ...(dto.maxDiscount !== undefined && { maxDiscount: dto.maxDiscount }),
        ...(dto.validFrom && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validUntil && { validUntil: new Date(dto.validUntil) }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // ===================== AUDIT LOGS =====================

  async getAuditLogs(page = 1, pageSize = 20, entity?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (entity) where.entity = entity;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
