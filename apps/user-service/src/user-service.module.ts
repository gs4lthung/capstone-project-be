import { Module } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { ConfigModule, ConfigService } from '@app/config';
import { UserServiceController } from './user-service.controller';
import { CloudinaryModule } from '@app/cloudinary';
import { Role } from '@app/database/entities/role.entity';
import { RedisModule } from '@app/redis';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoachCredential } from '@app/database/entities/coach_credential.entity';
import { CoachProfile } from '@app/database/entities/coach_profile.entity';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    CloudinaryModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User, Role, CoachCredential, CoachProfile]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: 'NOTIFICATION_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
            ],
            queue: 'notification_queue',
            queueOptions: {
              durable: configService.get('rabbitmq').durable,
              autoDelete: configService.get('rabbitmq').autoDelete,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
