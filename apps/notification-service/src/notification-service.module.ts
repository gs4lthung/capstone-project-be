import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { DatabaseModule } from '@app/database';
import { FcmToken } from '@app/database/entities/fcmToken.entity';
import { RedisModule } from '@app/redis';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    TypeOrmModule.forFeature([User, FcmToken]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
