import { Notification } from '@app/database/entities/notification.entity';
import { User } from '@app/database/entities/user.entity';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import { UserRole } from '@app/shared/enums/user.enum';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { SendNotification } from '@app/shared/interfaces/send-notification.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NotificationService extends BaseTypeOrmService<Notification> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly eventEmitter: EventEmitter2,
    private readonly datasource: DataSource,
  ) {
    super(notificationRepository);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const notification = await manager.getRepository(Notification).findOne({
        where: { id: notificationId },
        withDeleted: false,
      });
      if (!notification) throw new BadRequestException('NOT_FOUND');
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    });
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    return await this.datasource.transaction(async (manager) => {
      const notifications = await manager.getRepository(Notification).find({
        where: { user: { id: userId }, isRead: false },
        withDeleted: false,
      });
      for (const notification of notifications) {
        notification.isRead = true;
        await this.notificationRepository.save(notification);
      }
    });
  }

  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<Notification>> {
    return super.find(
      findOptions,
      'notification',
      PaginateObject<Notification>,
    );
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
      if (!user) throw new BadRequestException('NOT_FOUND');

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
