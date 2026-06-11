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
import { OrdersService } from './orders.service';
import { PlaceOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  async placeOrder(@CurrentUser() user: any, @Body() dto: PlaceOrderDto) {
    const order = await this.ordersService.placeOrder(user.id, dto);
    return { success: true, data: order };
  }

  @Get()
  @ApiOperation({ summary: 'List own orders (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.ordersService.getOrders(
      user.id,
      parseInt(page || '1'),
      parseInt(pageSize || '10'),
      status,
    );
    return { success: true, data: result.orders, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }

  @Get('kitchen')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'KITCHEN')
  @ApiOperation({ summary: 'Kitchen queue (KITCHEN/ADMIN only)' })
  async getKitchenQueue() {
    const orders = await this.ordersService.getKitchenQueue();
    return { success: true, data: orders };
  }

  @Get('production-summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'KITCHEN')
  @ApiOperation({ summary: 'Production summary for kitchen (KITCHEN/ADMIN only)' })
  @ApiQuery({ name: 'date', required: false })
  async getProductionSummary(@Query('date') date?: string) {
    const summary = await this.ordersService.getProductionSummary(date);
    return { success: true, data: summary };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'KITCHEN', 'DELIVERY')
  @ApiOperation({ summary: 'List all orders (Admin/Kitchen/Delivery)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false })
  async getAllOrders(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    const result = await this.ordersService.getAllOrders(
      parseInt(page || '1'),
      parseInt(pageSize || '20'),
      status,
      date,
    );
    return { success: true, data: result.orders, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail with status history' })
  async getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = ['ADMIN', 'KITCHEN', 'DELIVERY'].includes(user.role);
    const order = await this.ordersService.getOrderById(id, isAdmin ? undefined : user.id);
    return { success: true, data: order };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order (customer, if not yet preparing)' })
  async cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    const order = await this.ordersService.cancelOrder(id, user.id);
    return { success: true, data: order };
  }

  @Post(':id/verify-payment')
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  async verifyPayment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) {
    const order = await this.ordersService.verifyPayment(user.id, id, dto);
    return { success: true, data: order };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'KITCHEN', 'DELIVERY')
  @ApiOperation({ summary: 'Update order status (Kitchen/Admin/Delivery only)' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateOrderStatus(id, dto, user.id);
    return { success: true, data: order };
  }
}
