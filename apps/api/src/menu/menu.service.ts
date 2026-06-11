import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  SetDailyMenuDto,
  UpdateDailyMenuDto,
} from './dto/menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== CATEGORIES =====================

  async getCategories(activeOnly = true) {
    return this.prisma.category.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { menuItems: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.findCategoryById(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async findCategoryById(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  // ===================== MENU ITEMS =====================

  async getMenuItems(filters: {
    categoryId?: string;
    date?: string;
    isHealthy?: boolean;
    isActive?: boolean;
  }) {
    const where: any = { isActive: filters.isActive !== false ? true : undefined };

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isHealthy !== undefined) where.isHealthy = filters.isHealthy;

    // If date filter provided, join with dailyMenus
    if (filters.date) {
      const targetDate = new Date(filters.date);
      where.dailyMenus = {
        some: {
          date: targetDate,
          isAvailable: true,
        },
      };
    }

    return this.prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        ...(filters.date && {
          dailyMenus: {
            where: {
              date: new Date(filters.date),
            },
          },
        }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getMenuItemById(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async createMenuItem(dto: CreateMenuItemDto) {
    const { tags, ...itemData } = dto;

    await this.findCategoryById(dto.categoryId);

    return this.prisma.$transaction(async (tx: any) => {
      const item = await tx.menuItem.create({ data: itemData });

      if (tags && tags.length > 0) {
        await this.upsertTags(tx, item.id, tags);
      }

      return tx.menuItem.findUnique({
        where: { id: item.id },
        include: { category: true, tags: { include: { tag: true } } },
      });
    });
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto) {
    await this.getMenuItemById(id);
    const { tags, ...itemData } = dto;

    return this.prisma.$transaction(async (tx: any) => {
      const item = await tx.menuItem.update({
        where: { id },
        data: itemData,
      });

      if (tags !== undefined) {
        await tx.menuItemTag.deleteMany({ where: { menuItemId: id } });
        if (tags.length > 0) {
          await this.upsertTags(tx, id, tags);
        }
      }

      return tx.menuItem.findUnique({
        where: { id: item.id },
        include: { category: true, tags: { include: { tag: true } } },
      });
    });
  }

  async deleteMenuItem(id: string) {
    await this.getMenuItemById(id);
    await this.prisma.menuItem.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Menu item deactivated' };
  }

  // ===================== DAILY MENU =====================

  async getDailyMenu(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    // Set time to start of day
    targetDate.setHours(0, 0, 0, 0);

    const tomorrowDate = new Date(targetDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const [todayMenu, tomorrowMenu] = await Promise.all([
      this.prisma.dailyMenu.findMany({
        where: { date: targetDate },
        include: {
          menuItem: {
            include: { category: true, tags: { include: { tag: true } } },
          },
        },
        orderBy: { menuItem: { sortOrder: 'asc' } },
      }),
      this.prisma.dailyMenu.findMany({
        where: { date: tomorrowDate },
        include: {
          menuItem: {
            include: { category: true, tags: { include: { tag: true } } },
          },
        },
        orderBy: { menuItem: { sortOrder: 'asc' } },
      }),
    ]);

    return {
      today: {
        date: targetDate.toISOString().split('T')[0],
        items: todayMenu,
      },
      tomorrow: {
        date: tomorrowDate.toISOString().split('T')[0],
        items: tomorrowMenu,
      },
    };
  }

  async setDailyMenu(dto: SetDailyMenuDto) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    await this.getMenuItemById(dto.menuItemId);

    return this.prisma.dailyMenu.upsert({
      where: {
        date_menuItemId: {
          date,
          menuItemId: dto.menuItemId,
        },
      },
      create: {
        date,
        menuItemId: dto.menuItemId,
        availableQty: dto.availableQty ?? 100,
        remainingQty: dto.availableQty ?? 100,
        isAvailable: dto.isAvailable ?? true,
      },
      update: {
        availableQty: dto.availableQty ?? 100,
        isAvailable: dto.isAvailable ?? true,
      },
      include: { menuItem: true },
    });
  }

  async updateDailyMenu(id: string, dto: UpdateDailyMenuDto) {
    const entry = await this.prisma.dailyMenu.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Daily menu entry not found');

    return this.prisma.dailyMenu.update({
      where: { id },
      data: dto,
      include: { menuItem: true },
    });
  }

  private async upsertTags(tx: any, menuItemId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      const tag = await tx.menuTag.upsert({
        where: { slug },
        create: { name: tagName, slug },
        update: {},
      });
      await tx.menuItemTag.upsert({
        where: { menuItemId_tagId: { menuItemId, tagId: tag.id } },
        create: { menuItemId, tagId: tag.id },
        update: {},
      });
    }
  }
}
