import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List own notifications (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getNotifications(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.notificationsService.getNotifications(
      user.id,
      parseInt(page || '1'),
      parseInt(pageSize || '20'),
    );
    return { success: true, data: result.notifications, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: any) {
    const result = await this.notificationsService.getUnreadCount(user.id);
    return { success: true, data: result };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationsService.markAllAsRead(user.id);
    return { success: true, data: result };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(id, user.id);
    return { success: true, data: notification };
  }
}
