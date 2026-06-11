import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/',
})
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_kitchen')
  handleJoinKitchen(@ConnectedSocket() client: Socket) {
    client.join('kitchen');
    return { event: 'joined', data: 'kitchen' };
  }

  @SubscribeMessage('join_delivery')
  handleJoinDelivery(
    @MessageBody() data: { driverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`driver_${data.driverId}`);
    return { event: 'joined', data: `driver_${data.driverId}` };
  }

  @SubscribeMessage('join_user')
  handleJoinUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user_${data.userId}`);
    return { event: 'joined', data: `user_${data.userId}` };
  }

  emitNewOrder(order: any) {
    this.server.to('kitchen').emit('new_order', order);
    this.logger.log(`New order emitted: ${order.orderNumber}`);
  }

  emitOrderStatusUpdate(orderId: string, status: string, userId?: string) {
    this.server.emit('order_status_update', { orderId, status });
    if (userId) {
      this.server.to(`user_${userId}`).emit('my_order_update', { orderId, status });
    }
    this.logger.log(`Order ${orderId} status updated to ${status}`);
  }

  emitDeliveryUpdate(deliveryId: string, data: any) {
    this.server.emit('delivery_update', { deliveryId, ...data });
  }

  emitNotification(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
