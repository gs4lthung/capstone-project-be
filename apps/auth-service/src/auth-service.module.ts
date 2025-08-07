import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { ConfigModule, ConfigService } from '@app/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { DatabaseModule } from '@app/database';
import { Role } from '@app/database/entities/role.entity';
import { RedisModule } from '@app/redis';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt').access_token.secret,
        signOptions: {
          expiresIn: configService.get('jwt').access_token.expiration,
        },
      }),
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, Role, AuthProvider]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: 'MAIL_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}`,
            ],
            queue: 'mail_queue',
            queueOptions: {
              durable: configService.get('rabbitmq').durable,
              autoDelete: configService.get('rabbitmq').autoDelete,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
