import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  CreateCouponDto,
  UpdateCouponDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===================== USERS =====================

  @Get('users')
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.adminService.getAllUsers(
      parseInt(page || '1'),
      parseInt(pageSize || '20'),
      role,
      search,
    );
    return { success: true, data: result.users, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail (Admin only)' })
  async getUserById(@Param('id') id: string) {
    const user = await this.adminService.getUserById(id);
    return { success: true, data: user };
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role (Admin only)' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.adminService.updateUserRole(id, dto);
    return { success: true, data: user };
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Enable/disable user (Admin only)' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const user = await this.adminService.updateUserStatus(id, dto);
    return { success: true, data: user };
  }

  // ===================== COUPONS =====================

  @Get('coupons')
  @ApiOperation({ summary: 'List coupons (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getCoupons(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.adminService.getCoupons(
      parseInt(page || '1'),
      parseInt(pageSize || '20'),
    );
    return { success: true, data: result.coupons, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create coupon (Admin only)' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.adminService.createCoupon(dto);
    return { success: true, data: coupon };
  }

  @Patch('coupons/:id')
  @ApiOperation({ summary: 'Update coupon (Admin only)' })
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const coupon = await this.adminService.updateCoupon(id, dto);
    return { success: true, data: coupon };
  }

  // ===================== AUDIT LOGS =====================

  @Get('audit-logs')
  @ApiOperation({ summary: 'Paginated audit log (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'entity', required: false })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('entity') entity?: string,
  ) {
    const result = await this.adminService.getAuditLogs(
      parseInt(page || '1'),
      parseInt(pageSize || '20'),
      entity,
    );
    return { success: true, data: result.logs, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }
}
