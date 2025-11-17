import { Notification } from '@app/database/entities/notification.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { UserRole } from '@app/shared/enums/user.enum';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly eventEmitter: EventEmitter2,
    private readonly datasource: DataSource,
  ) {}

  async markNotificationAsRead(notificationId: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const notification = await manager.getRepository(Notification).findOne({
        where: { id: notificationId },
        withDeleted: false,
      });
      if (!notification)
        throw new CustomRpcException(
          'NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    });
  }

  async getUserUnreadNotifications(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
  }

  async sendNotification(data: SendNotification) {
    return await this.datasource.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({
        where: { id: data.userId },
        withDeleted: false,
      });
      if (!user)
        throw new CustomRpcException(
          'NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const notification = manager.getRepository(Notification).create({
        title: data.title,
        body: data.body,
        navigateTo: data.navigateTo,
        type: data.type,
        user: user,
      });
      await manager.getRepository(Notification).save(notification);

      this.eventEmitter.emit('notification.send', {
        userId: data.userId,
        title: data.title,
        body: data.body,
        navigateTo: data.navigateTo,
        type: data.type,
      } as SendNotification);
    });
  }

  async sendNotificationToAdmins(payload: SendNotification) {
    const admins = await this.userRepository.find({
      where: {
        role: {
          name: UserRole.ADMIN,
        },
      },
    });
    for (const admin of admins) {
      await this.sendNotification({ userId: admin.id, ...payload });
    }
  }
}
