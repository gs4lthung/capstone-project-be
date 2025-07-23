import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@app/config';
import { DatabaseModule } from '@app/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import { SocketGateway } from './socket/socket.gateway';
import { ErrorModule } from './error/error.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ErrorModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: 'AUTH_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('auth_service').host,
            port: configService.get('auth_service').port,
          },
        }),
      },
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: 'USER_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('user_service').host,
            port: configService.get('user_service').port,
          },
        }),
      },
    ]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('rate_limiter')?.time,
            limit: configService.get('rate_limiter')?.max_requests,
          },
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway, ConfigService, JwtService],
})
export class AppModule {}
