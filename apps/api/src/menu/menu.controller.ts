import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  SetDailyMenuDto,
  UpdateDailyMenuDto,
} from './dto/menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ===================== CATEGORIES =====================

  @Get('categories')
  @ApiOperation({ summary: 'List all active categories' })
  async getCategories(@Query('all') all?: string) {
    const categories = await this.menuService.getCategories(all !== 'true');
    return { success: true, data: categories };
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (Admin only)' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.menuService.createCategory(dto);
    return { success: true, data: category };
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (Admin only)' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.menuService.updateCategory(id, dto);
    return { success: true, data: category };
  }

  // ===================== MENU ITEMS =====================

  @Get('items')
  @ApiOperation({ summary: 'List menu items with optional filters' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'isHealthy', required: false, type: Boolean })
  async getMenuItems(
    @Query('categoryId') categoryId?: string,
    @Query('date') date?: string,
    @Query('isHealthy') isHealthy?: string,
  ) {
    const items = await this.menuService.getMenuItems({
      categoryId,
      date,
      isHealthy: isHealthy !== undefined ? isHealthy === 'true' : undefined,
    });
    return { success: true, data: items };
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get menu item detail' })
  async getMenuItem(@Param('id') id: string) {
    const item = await this.menuService.getMenuItemById(id);
    return { success: true, data: item };
  }

  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu item (Admin only)' })
  async createMenuItem(@Body() dto: CreateMenuItemDto) {
    const item = await this.menuService.createMenuItem(dto);
    return { success: true, data: item };
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item (Admin only)' })
  async updateMenuItem(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const item = await this.menuService.updateMenuItem(id, dto);
    return { success: true, data: item };
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete menu item (Admin only)' })
  async deleteMenuItem(@Param('id') id: string) {
    const result = await this.menuService.deleteMenuItem(id);
    return { success: true, data: result };
  }

  // ===================== DAILY MENU =====================

  @Get('daily')
  @ApiOperation({ summary: "Get today's and tomorrow's daily menu" })
  @ApiQuery({ name: 'date', required: false })
  async getDailyMenu(@Query('date') date?: string) {
    const menu = await this.menuService.getDailyMenu(date);
    return { success: true, data: menu };
  }

  @Post('daily')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set daily menu availability (Admin only)' })
  async setDailyMenu(@Body() dto: SetDailyMenuDto) {
    const entry = await this.menuService.setDailyMenu(dto);
    return { success: true, data: entry };
  }

  @Patch('daily/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update daily availability entry (Admin only)' })
  async updateDailyMenu(
    @Param('id') id: string,
    @Body() dto: UpdateDailyMenuDto,
  ) {
    const entry = await this.menuService.updateDailyMenu(id, dto);
    return { success: true, data: entry };
  }
}
