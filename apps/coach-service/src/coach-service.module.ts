import { Module } from '@nestjs/common';
import { CoachServiceController } from './coach-service.controller';
import { CoachServiceService } from './coach-service.service';
import { ConfigModule, ConfigService } from '@app/config';
import { RedisModule } from '@app/redis';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { CoachProfile } from '@app/database/entities/coach_profile.entity';
import { CoachCredential } from '@app/database/entities/coach_credential.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoachPackage } from '@app/database/entities/coach_packages.entity';
import { AmqpConnectionManagerSocketOptions } from '@nestjs/microservices/external/rmq-url.interface';
import { Role } from '@app/database/entities/role.entity';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    DatabaseModule,
    TypeOrmModule.forFeature([
      User,
      CoachCredential,
      CoachProfile,
      CoachPackage,
      Role,
    ]),
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
            socketOptions: {
              reconnectTimeInSeconds: 5,
              heartbeatIntervalInSeconds: 5,
            } as AmqpConnectionManagerSocketOptions,
          },
        }),
      },
    ]),
  ],
  controllers: [CoachServiceController],
  providers: [CoachServiceService],
})
export class CoachServiceModule {}
