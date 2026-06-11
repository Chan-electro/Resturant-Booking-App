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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { AssignDeliveryDto, ConfirmDeliveryDto } from './dto/delivery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('assignments')
  @UseGuards(RolesGuard)
  @Roles('DELIVERY', 'ADMIN')
  @ApiOperation({ summary: 'Get driver assignments' })
  async getAssignments(@CurrentUser() user: any) {
    const driverId = user.role === 'ADMIN' ? undefined : user.id;
    const assignments = await this.deliveryService.getDriverAssignments(driverId || user.id);
    return { success: true, data: assignments };
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles('DELIVERY', 'ADMIN')
  @ApiOperation({ summary: 'Completed deliveries history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.deliveryService.getDriverHistory(
      user.id,
      parseInt(page || '1'),
      parseInt(pageSize || '20'),
    );
    return { success: true, data: result.deliveries, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign delivery to driver (Admin only)' })
  async assignDelivery(@CurrentUser() user: any, @Body() dto: AssignDeliveryDto) {
    const delivery = await this.deliveryService.assignDelivery(dto, user.id);
    return { success: true, data: delivery };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('DELIVERY', 'ADMIN')
  @ApiOperation({ summary: 'Get delivery detail' })
  async getDelivery(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user.role === 'ADMIN';
    const delivery = await this.deliveryService.getDeliveryById(id, isAdmin ? undefined : user.id);
    return { success: true, data: delivery };
  }

  @Patch(':id/pickup')
  @UseGuards(RolesGuard)
  @Roles('DELIVERY', 'ADMIN')
  @ApiOperation({ summary: 'Confirm pickup' })
  async confirmPickup(@CurrentUser() user: any, @Param('id') id: string) {
    const delivery = await this.deliveryService.confirmPickup(id, user.id);
    return { success: true, data: delivery };
  }

  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles('DELIVERY', 'ADMIN')
  @ApiOperation({ summary: 'Confirm delivery + COD amount' })
  async confirmDelivery(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ConfirmDeliveryDto,
  ) {
    const delivery = await this.deliveryService.confirmDelivery(id, user.id, dto);
    return { success: true, data: delivery };
  }
}
