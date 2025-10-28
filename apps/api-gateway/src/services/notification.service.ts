import { Notification } from '@app/database/entities/notification.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { NotificationStatusEnum } from '@app/shared/enums/notification.enum';
import { UserRole } from '@app/shared/enums/user.enum';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

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
      if (notification) {
        await this.notificationRepository.update(notification.id, {
          status: NotificationStatusEnum.ERROR,
        });
      }
      channel.noAck(ctx.getMessage(), false, false);
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  async sendNotificationToAdmins(
    { title, body }: SendNotification,
    ctx: RmqContext,
  ) {
    const admins = await this.userRepository.find({
      where: {
        role: {
          name: UserRole.ADMIN,
        },
      },
    });
    for (const admin of admins) {
      await this.sendNotification({ userId: admin.id, title, body }, ctx);
    }
  }
}
