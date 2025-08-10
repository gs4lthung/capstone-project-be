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
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app.resolver';
import { ApolloDriver } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Error } from '@app/database/entities/error.entity';
import { User } from '@app/database/entities/user.entity';
import { FirebaseModule } from '@app/firebase';
import { RedisModule } from '@app/redis';
import { GoogleStrategy } from './strategies/google.strategy';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule,
    ServeStaticModule.forRoot({
      rootPath: 'public',
      serveRoot: '/',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Error, User]),
    ErrorModule,
    FirebaseModule,
    RedisModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: __dirname + '/src/i18n',
      },
      loader: I18nJsonLoader,
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-lang']),
      ],
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => ({
        autoSchemaFile: true,
        context: ({ req }) => ({ headers: req.headers }),
        playground: configService.get('graphql').playground,
        introspection: configService.get('graphql').introspection,
        buildSchemaOptions: {
          dateScalarMode: 'timestamp' as const,
        },
      }),
    }),
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
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: 'MAIL_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('rabbitmq').username}:${configService.get('rabbitmq').password}@${configService.get('rabbitmq').host}:${configService.get('rabbitmq').port}/${configService.get('rabbitmq').username}`,
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
    AppResolver,
    SocketGateway,
    ConfigService,
    JwtService,
    GoogleStrategy,
  ],
})
export class AppModule {}
