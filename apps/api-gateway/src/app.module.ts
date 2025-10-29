import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@app/config';
import { DatabaseModule } from '@app/database';
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
import { ScheduleModule } from '@nestjs/schedule';
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
import { AwsModule } from '@app/aws';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './services/mail.service';
import { Course } from '@app/database/entities/course.entity';
import { Schedule } from '@app/database/entities/schedule.entity';
import { Request } from '@app/database/entities/request.entity';
import { RequestService } from './services/request.service';
import { RequestController } from './controllers/request.controller';
import { RequestAction } from '@app/database/entities/request-action.entity';
import { Session } from '@app/database/entities/session.entity';
import { SessionService } from './services/session.service';
import { RequestResolver } from './resolvers/request.resolver';
import { CourseResolver } from './resolvers/course.resolver';
import { CourseService } from './services/course.service';
import { CourseController } from './controllers/course.controller';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { CronService } from './services/cron.service';
import { PayosModule } from '@app/payos';
import { Payment } from '@app/database/entities/payment.entity';
import { PayosController } from './controllers/payos.controller';
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controllet';
import { Subject } from '@app/database/entities/subject.entity';
import { Lesson } from '@app/database/entities/lesson.entity';
import { LessonService } from './services/lesson.service';
import { LessonController } from './controllers/lesson.controllet';
import { FfmpegModule } from '@app/ffmpeg';

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
    AwsModule,
    FfmpegModule,
    PayosModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail').host,
          port: configService.get('mail').port,
          secure: configService.get('mail').secure,
          auth: {
            user: configService.get('mail').user,
            pass: configService.get('mail').pass,
          },
        },
        defaults: {
          from: `"No Reply" <Hello>`,
        },
        template: {
          dir: __dirname + '/src/mail-templates',
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: true,
          }),
          options: {
            strict: true,
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([
      Error,
      User,
      Notification,
      Role,
      AuthProvider,
      Course,
      Enrollment,
      Schedule,
      Request,
      RequestAction,
      Session,
      Subject,
      Payment,
      Lesson,
    ]),
    ErrorModule,
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
    PayosController,
    RequestController,
    CourseController,
    LessonController,
    SubjectController,
  ],
  providers: [
    AppService,
    UserService,
    UserResolver,
    RequestResolver,
    CourseResolver,
    CourseService,
    AuthService,
    SocketGateway,
    ConfigService,
    JwtService,
    GoogleStrategy,
    RequestService,
    MailService,
    SessionService,
    CronService,
    SubjectService,
    LessonService,
  ],
})
export class AppModule {}
