import { Controller } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';

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
}
