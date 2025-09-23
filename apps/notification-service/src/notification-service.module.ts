import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { DatabaseModule } from '@app/database';
import { FcmToken } from '@app/database/entities/fcm-token.entity';
import { RedisModule } from '@app/redis';
import { Notification } from '@app/database/entities/notification.entity';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    TypeOrmModule.forFeature([User, FcmToken, Notification]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
