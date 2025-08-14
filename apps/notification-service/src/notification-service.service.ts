import { FcmToken } from '@app/database/entities/fcmToken.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationServiceService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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

  async sendNotification({ userId, title, body }: SendNotification) {
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
      if (isUserOnline) {
        await this.redisService.publish('notifications', {
          userId,
          title,
          body,
        });
        return;
      }
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
