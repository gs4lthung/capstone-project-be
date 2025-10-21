import { Logger, OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ErrorLoggingFilter } from '../filters/error.filter';
import { AuthGuard } from '../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@app/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '@app/database/entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationStatusEnum } from '@app/shared/enums/notification.enum';
import { JwtPayloadDto } from '@app/shared/dtos/auth/jwt.payload.dto';

@WebSocketGateway({
  namespace: '/ws',
})
@UseGuards(AuthGuard)
@UseFilters(ErrorLoggingFilter)
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  onModuleInit() {
    this.handleNotificationEvent();
  }

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
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
    }
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(client: Socket): void {
    const userId = (client as any).userId;
    if (userId) {
    }
  }

  handleNotificationEvent() {}

  @SubscribeMessage('notification:delivered')
  async handleNotificationDelivered(
    client: Socket,
    @MessageBody() payload: { notificationId: string },
  ): Promise<void> {
    try {
      await this.notificationRepository.update(payload.notificationId, {
        status: NotificationStatusEnum.DELIVERED,
      });
    } catch (error) {
      await this.notificationRepository.update(payload.notificationId, {
        status: NotificationStatusEnum.ERROR,
      });
      this.logger.error('Error updating notification status:', error);
    }
  }
}
