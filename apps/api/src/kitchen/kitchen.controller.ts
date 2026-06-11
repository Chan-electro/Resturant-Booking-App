import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from '../orders/orders.service';
import { UpdateOrderStatusDto } from '../orders/dto/order.dto';

@ApiTags('Kitchen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'KITCHEN')
@Controller('kitchen')
export class KitchenController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Get active kitchen order queue' })
  async getOrders() {
    const orders = await this.ordersService.getKitchenQueue();
    return { success: true, data: orders };
  }

  @Get('production')
  @ApiOperation({ summary: 'Get production summary for today' })
  @ApiQuery({ name: 'date', required: false })
  async getProduction(@Query('date') date?: string) {
    const summary = await this.ordersService.getProductionSummary(date);
    return { success: true, data: summary };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order detail' })
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrderById(id);
    return { success: true, data: order };
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status (preparing/ready)' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateOrderStatus(id, dto, user.id);
    return { success: true, data: order };
  }
}
