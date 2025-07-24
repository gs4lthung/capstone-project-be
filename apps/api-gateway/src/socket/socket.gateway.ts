import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ErrorLoggingFilter } from '../error/error.filter';
import { AuthGuard } from '../guards/auth.guard';

@WebSocketGateway({
  namespace: '/ws',
})
@UseFilters(ErrorLoggingFilter)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  @UseGuards(AuthGuard)
  handleMessage(client: Socket, payload: any): void {
    throw new WsException('This is a custom WebSocket exception');
  }
}
