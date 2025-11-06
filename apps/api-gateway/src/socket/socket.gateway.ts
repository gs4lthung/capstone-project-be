import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ErrorLoggingFilter } from '../filters/error.filter';
import { AuthGuard } from '../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@app/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '@app/database/entities/notification.entity';
import { Repository } from 'typeorm';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';
import { NotificationService } from '../services/notification.service';
import { OnEvent } from '@nestjs/event-emitter';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';

@WebSocketGateway({
  namespace: '/ws',
})
@UseGuards(AuthGuard)
@UseFilters(ErrorLoggingFilter)
export class SocketGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationService: NotificationService,
  ) {}
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  private onlineUsers = new Map();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.accessToken as string;
      if (!token) {
        client.disconnect();
      }

      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt').access_token.secret,
      });

      (client as any).userId = payload.id;

      this.onlineUsers.set(payload.id, client.id);

      const unreadNotifications =
        await this.notificationService.getUserUnreadNotifications(payload.id);
      for (const notification of unreadNotifications) {
        client.emit('notification.send', notification);
      }

      client.on('notification.read', async (notificationId: number) => {
        await this.notificationService.markNotificationAsRead(notificationId);
      });

      client.on('disconnect', () => {
        this.onlineUsers.forEach((value, key) => {
          if (value === client.id) {
            this.onlineUsers.delete(key);
          }
        });
      });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
    }
  }

  @OnEvent('notification.send')
  async handleSendNotificationEvent(payload: SendNotification) {
    const clientId = this.onlineUsers.get(payload.userId);
    if (clientId) {
      this.server.to(clientId).emit('notification.send', payload);
    }
  }
}
