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
import { CloudinaryModule } from '@app/cloudinary';
import { Role } from '@app/database/entities/role.entity';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { ChatService } from './services/chat.service';
import { Chat } from '@app/database/entities/chat.entity';
import { ChatMember } from '@app/database/entities/chat-members.entity';
import { Message } from '@app/database/entities/message.entity';
import { MessageRead } from '@app/database/entities/message-read.entity';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { ChatController } from './controllers/chat.controller';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { Order } from '@app/database/entities/order.entity';

const tcp_services = [
  { name: 'AUTH_SERVICE' },
  { name: 'USER_SERVICE' },
  { name: 'ORDER_SERVICE' },
  { name: 'CHAT_SERVICE' },
];

const rmb_services = [
  { name: 'PAYMENT_SERVICE', queue: 'payment_queue' },
  { name: 'NOTIFICATION_SERVICE', queue: 'notification_queue' },
  { name: 'MESSAGE_SERVICE', queue: 'message_queue' },
  { name: 'MAIL_SERVICE', queue: 'mail_queue' },
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
    CloudinaryModule,
    TypeOrmModule.forFeature([
      Error,
      User,
      Notification,
      Role,
      AuthProvider,
      Chat,
      ChatMember,
      Message,
      MessageRead,
      Order,
    ]),
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
        fieldResolverEnhancers: ['interceptors'],
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
  controllers: [
    AppController,
    UserController,
    AuthController,
    ChatController,
    OrderController,
  ],
  providers: [
    AppService,
    UserService,
    UserResolver,
    AuthService,
    ChatService,
    OrderService,
    SocketGateway,
    ConfigService,
    JwtService,
    GoogleStrategy,
  ],
})
export class AppModule {}
