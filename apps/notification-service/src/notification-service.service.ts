import { FcmToken } from '@app/database/entities/fcmToken.entity';
import { User } from '@app/database/entities/user.entity';
import { RegisterFcmTokenDto } from '@app/shared/dtos/notifications/register-fcm-token.dto';
import { CustomRpcException } from '@app/shared/exceptions/custom-rpc.exception';
import { CustomApiResponse } from '@app/shared/responses/custom-api.response';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationServiceService {
  constructor(
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
        throw new CustomRpcException('User not found', HttpStatus.NOT_FOUND);

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
        await this.fcmTokenRepository.save(newToken);

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
}
