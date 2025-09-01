import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@app/config';
import { DatabaseModule } from '@app/database';
import {
  ClientsModule,
  ClientsProviderAsyncOptions,
  Transport,
} from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import { SocketGateway } from './socket/socket.gateway';
import { ErrorModule } from './filters/filter.module';
import { JwtService } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Error } from '@app/database/entities/error.entity';
import { User } from '@app/database/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  AcceptLanguageResolver,
  GraphQLWebsocketResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@app/redis';
import { Notification } from '@app/database/entities/notification.entity';
import { UserResolver } from './resolvers/user.resolver';
import { MulterModule } from '@nestjs/platform-express';
import { FileUtils } from '@app/shared/utils/file.util';

const tcp_services = [
  { name: 'AUTH_SERVICE' },
  { name: 'USER_SERVICE' },
  { name: 'ORDER_SERVICE' },
];

const rmb_services = [
  { name: 'PAYMENT_SERVICE', queue: 'payment_queue' },
  { name: 'NOTIFICATION_SERVICE', queue: 'notification_queue' },
  { name: 'MESSAGE_SERVICE', queue: 'message_queue' },
  { name: 'MAIL_SERVICE', queue: 'mail_queue' },
  { name: 'CHAT_SERVICE', queue: 'chat_queue' },
  { name: 'VIDEO_SERVICE', queue: 'video_queue' },
];

@Module({
  imports: [
    ConfigModule,
    ServeStaticModule.forRoot({
      rootPath: 'public',
      serveRoot: '/',
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
        storage: FileUtils.fileStorage,
        fileFilter: FileUtils.fileFilter,
      }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    TypeOrmModule.forFeature([Error, User, Notification]),
    ErrorModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: __dirname + '/src/i18n',
      },
      loader: I18nJsonLoader,
      resolvers: [
        GraphQLWebsocketResolver,
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => ({
        autoSchemaFile: true,
        context: (ctx) => ctx,
        playground: configService.get('graphql').playground,
        introspection: configService.get('graphql').introspection,
        buildSchemaOptions: {
          dateScalarMode: 'timestamp' as const,
        },
        subscriptions: {
          'graphql-ws': true,
        },
      }),
    }),
    ClientsModule.registerAsync([
      ...tcp_services.map(
        ({ name }) =>
          ({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: name,
            useFactory: async (configService: ConfigService) => ({
              transport: Transport.TCP,
              options: {
                host: configService.getByServiceName(name.toLowerCase()).host,
                port: configService.getByServiceName(name.toLowerCase()).port,
              },
            }),
          }) as ClientsProviderAsyncOptions,
      ),
      ...rmb_services.map(
        ({ name, queue }) =>
          ({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: name,
            useFactory: async (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [
                  `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
                ],
                queue: queue,
                queueOptions: {
                  durable: true,
                },
              },
            }),
          }) as ClientsProviderAsyncOptions,
      ),
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
  providers: [
    AppService,
    UserResolver,
    SocketGateway,
    ConfigService,
    JwtService,
    GoogleStrategy,
  ],
})
export class AppModule {}
