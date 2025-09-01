import { FcmToken } from '@app/database/entities/fcmToken.entity';
import { Notification } from '@app/database/entities/notification.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { NotificationStatusEnum } from '@app/shared/enums/notification.enum';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationServiceService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async registerFcmToken(
    userId: number,
    data: RegisterFcmTokenDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['fcmTokens'],
      });

      if (!user)
        throw new CustomRpcException(
          'NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const existingToken = user.fcmTokens.find((t) => t.token === data.token);

      const now = new Date();

      if (existingToken) {
        existingToken.lastSeenAt = now;
        existingToken.deviceType = data.deviceType;
        existingToken.browser = data.browser;
        existingToken.platform = data.platform;
      } else {
        const newToken = this.fcmTokenRepository.create({
          token: data.token,
          deviceType: data.deviceType,
          browser: data.browser,
          platform: data.platform,
          user: user,
        });
        if (!user.fcmTokens) user.fcmTokens = [];
        user.fcmTokens.push(newToken);
      }
      await this.userRepository.save(user);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'FCM token registered successfully',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async sendNotification(
    { userId, title, body }: SendNotification,
    ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    let notification: Notification;
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException(
          'NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const isUserOnline = await this.redisService.isUserOnline(userId);

      notification = this.notificationRepository.create({
        title: title,
        body: body,
        user: user,
        status: NotificationStatusEnum.PENDING,
      });
      await this.notificationRepository.save(notification);

      if (isUserOnline) {
        await this.redisService.publish('notifications', {
          notificationId: notification.id,
          userId,
          title,
          body,
        } as SendNotification);
        return;
      }
    } catch (error) {
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatusEnum.ERROR,
      });
      channel.noAck(ctx.getMessage(), false, false);
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
