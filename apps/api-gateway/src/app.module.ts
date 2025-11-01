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
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controller';
import { Subject } from '@app/database/entities/subject.entity';
import { Lesson } from '@app/database/entities/lesson.entity';
import { LessonService } from './services/lesson.service';
import { LessonController } from './controllers/lesson.controller';
import { FfmpegModule } from '@app/ffmpeg';
import { SubjectResolver } from './resolvers/subject.resolver';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { Coach } from '@app/database/entities/coach.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { CoachController } from './controllers/coach.controller';
import { CoachService } from './services/coach.service';
import { Wallet } from '@app/database/entities/wallet.entity';
import { Bank } from '@app/database/entities/bank.entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { Configuration } from '@app/database/entities/configuration.entity';
import { SessionResolver } from './resolvers/session.resolver';
import { WalletResolver } from './resolvers/wallet.resolver';
import { PaymentResolver } from './resolvers/payment.resolver';
import { EnrollmentService } from './services/enrollment.service';
import { EnrollmentResolver } from './resolvers/enrollment.resolver';
import { Attendance } from '@app/database/entities/attendance.entity';
import { ConfigurationController } from './controllers/configuration.controller';
import { ConfigurationService } from './services/configuration.service';
import { SessionController } from './controllers/session.controller';
import { SessionEarning } from '@app/database/entities/session-earning.entity';

// ============================================
// ACHIEVEMENT IMPORTS
// ============================================
// Achievement Entities (6 entities)
import { Achievement } from '@app/database/entities/achievement.entity';
import { EventCountAchievement } from '@app/database/entities/event-count-achievement.entity';
import { StreakAchievement } from '@app/database/entities/streak-achievement.entity';
import { PropertyCheckAchievement } from '@app/database/entities/property-check-achievement.entity';
import { AchievementProgress } from '@app/database/entities/achievement-progress.entity';
import { LearnerAchievement } from '@app/database/entities/learner-achievement.entity';

// Achievement Controller & Service
import { AchievementController } from './controllers/achievement.controller';
import { AchievementService } from './services/achievement.service';

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
      Coach,
      Credential,
      Wallet,
      Configuration,
      Bank,
      Achievement,
      EventCountAchievement,
      StreakAchievement,
      PropertyCheckAchievement,
      AchievementProgress,
      LearnerAchievement,
      SessionEarning,
      Attendance,
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
    RequestController,
    CourseController,
    LessonController,
    SubjectController,
    PaymentController,
    CoachController,
    WalletController,
    AchievementController, // Achievement Management
    ConfigurationController,
    SessionController,
  ],
  providers: [
    AppService,
    UserService,
    UserResolver,
    RequestResolver,
    CourseResolver,
    CourseService,
    CoachService,
    AuthService,
    SocketGateway,
    ConfigService,
    JwtService,
    GoogleStrategy,
    RequestService,
    MailService,
    SessionService,
    SessionResolver,
    CronService,
    SubjectService,
    LessonService,
    SubjectResolver,
    WalletService,
    WalletResolver,
    PaymentService,
    AchievementService,
    PaymentResolver,
    EnrollmentService,
    EnrollmentResolver,
    ConfigurationService,
  ],
})
export class AppModule {}
