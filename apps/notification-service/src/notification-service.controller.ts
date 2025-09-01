import { Controller } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationServiceService: NotificationServiceService,
  ) {}

  @MessagePattern({ cmd: 'register_fcm_token' })
  async registerFcmToken(
    userId: number,
    @Payload() data: RegisterFcmTokenDto,
  ): Promise<CustomApiResponse<void>> {
    return this.notificationServiceService.registerFcmToken(userId, data);
  }

  @EventPattern('send_notification')
  async sendNotification(
    @Payload() data: SendNotification,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    return this.notificationServiceService.sendNotification(data, ctx);
  }
}
