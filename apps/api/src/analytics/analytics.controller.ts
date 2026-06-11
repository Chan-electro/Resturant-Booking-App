import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard KPIs (Admin only)' })
  async getDashboard() {
    const data = await this.analyticsService.getDashboard();
    return { success: true, data };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue by day (Admin only)' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (7 or 30)' })
  async getRevenue(@Query('days') days?: string) {
    const data = await this.analyticsService.getRevenueByDay(
      parseInt(days || '7'),
    );
    return { success: true, data };
  }

  @Get('top-items')
  @ApiOperation({ summary: 'Top selling items (Admin only)' })
  @ApiQuery({ name: 'limit', required: false })
  async getTopItems(@Query('limit') limit?: string) {
    const data = await this.analyticsService.getTopItems(parseInt(limit || '10'));
    return { success: true, data };
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Order count by status (Admin only)' })
  async getOrdersByStatus() {
    const data = await this.analyticsService.getOrdersByStatus();
    return { success: true, data };
  }
}
