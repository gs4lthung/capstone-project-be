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
import { Role } from '@app/database/entities/role.entity';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { Order } from '@app/database/entities/order.entity';
import { CoachProfile } from '@app/database/entities/coach-profile.entity';
import { CoachCredential } from '@app/database/entities/coach-credential.entity';
import { Video } from '@app/database/entities/video.entity';
import { CoachController } from './controllers/coach.controller';
import { CoachService } from './services/coach.service';
import { AmqpConnectionManagerSocketOptions } from '@nestjs/microservices/external/rmq-url.interface';
import { CustomWebsocketI18nResolver } from './resolvers/ws.resolver';
import { VideoController } from './controllers/video.controller';
import { VideoService } from './services/video.service';
import { LearnerController } from './controllers/learner.controller';
import { LearnerService } from './services/learner.service';

const tcp_services = [
  { name: 'AUTH_SERVICE' },
  { name: 'USER_SERVICE' },
  { name: 'ORDER_SERVICE' },
  { name: 'COACH_SERVICE' },
  { name: 'LEARNER_SERVICE' },
];

const rmb_services = [
  { name: 'PAYMENT_SERVICE', queue: 'payment_queue' },
  { name: 'NOTIFICATION_SERVICE', queue: 'notification_queue' },
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
    TypeOrmModule.forFeature([
      Error,
      User,
      Notification,
      Role,
      AuthProvider,
      Order,
      CoachProfile,
      CoachCredential,
      Video,
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
        CustomWebsocketI18nResolver,
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
        fieldResolverEnhancers: ['interceptors', 'guards', 'filters'],
      }),
    }),
    ClientsModule.registerAsync([
      ...tcp_services.map(
        ({ name }) =>
          (console.log(`Setting up TCP client for ${name}`),
          {
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
          (console.log(`Setting up RMQ client for ${name} on ${queue}`),
          {
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
                socketOptions: {
                  reconnectTimeInSeconds: 5,
                  heartbeatIntervalInSeconds: 5,
                } as AmqpConnectionManagerSocketOptions,
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
    OrderController,
    VideoController,
    CoachController,
    LearnerController,
  ],
  providers: [
    AppService,
    UserService,
    UserResolver,
    CoachService,
    VideoService,
    AuthService,
    LearnerService,
    OrderService,
    SocketGateway,
    ConfigService,
    JwtService,
    GoogleStrategy,
  ],
})
export class AppModule {}
