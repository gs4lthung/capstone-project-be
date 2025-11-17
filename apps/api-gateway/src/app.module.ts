import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@app/config';
import { DatabaseModule } from '@app/database';
import { ThrottlerModule } from '@nestjs/throttler';
import { SocketGateway } from './socket/socket.gateway';
import { ErrorModule } from './filters/filter.module';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Error } from '@app/database/entities/error.entity';
import { User } from '@app/database/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification } from '@app/database/entities/notification.entity';
import { MulterModule } from '@nestjs/platform-express';
import { FileUtils } from '@app/shared/utils/file.util';
import { Role } from '@app/database/entities/role.entity';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
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
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { Coach } from '@app/database/entities/coach.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { Learner } from '@app/database/entities/learner.entity';
import { CoachController } from './controllers/coach.controller';
import { CoachService } from './services/coach.service';
import { Wallet } from '@app/database/entities/wallet.entity';
import { Bank } from '@app/database/entities/bank.entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { Configuration } from '@app/database/entities/configuration.entity';
import { EnrollmentService } from './services/enrollment.service';
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
import { AchievementTrackingService } from './services/achievement-tracking.service';
import { AchievementTracking } from '@app/database/entities/achievement-tracking.entity';
import { QuizService } from './services/quiz.service';
import { QuizController } from './controllers/quiz.controller';
import { Quiz } from '@app/database/entities/quiz.entity';
import { Video } from '@app/database/entities/video.entity';
import { VideoService } from './services/video.service';
import { VideoController } from './controllers/video.controller';
import { QuizAttempt } from '@app/database/entities/quiz_attempt.entity';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { Feedback } from '@app/database/entities/feedback.entity';
import { FeedbackController } from './controllers/feedback.controller';
import { FeedbackService } from './services/feedback.service';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { LearnerProgressController } from './controllers/learner-progress.controller';
import { LearnerProgressService } from './services/learner-progress.service';
import { VideoConference } from '@app/database/entities/video-conference.entity';
import { AgoraModule } from '@app/agora';
import { VideoConferenceController } from './controllers/video-conference.controller';
import { VideoConferenceService } from './services/video-conference.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationService } from './services/notification.service';
import { Province } from '@app/database/entities/province.entity';
import { District } from '@app/database/entities/district.entity';
import { ProvinceService } from './services/province.service';
import { ProvinceController } from './controllers/province.controller';
import { StudentAnalysisController } from './controllers/student-analysis.controller';
import { StudentAnalysisService } from './services/student-analysis.service';
import { TwilioModule } from '@app/twilio';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ScheduleService } from './services/schedule.service';
import { ScheduleController } from './controllers/schedule.controller';
import { PlatformAnalysisService } from './services/platform-analysis.service';
import { PlatformAnalysisController } from './controllers/platform-analysis.controller';
import { LearnerVideoController } from './controllers/learner-video.controller';
import { LearnerVideoService } from './services/learner-video.service';
import { LearnerVideo } from '@app/database/entities/learner-video.entity';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { AiVideoCompareResultController } from './controllers/ai-video-compare-result.controller';
import { AiVideoCompareResultService } from './services/ai-video-compare-result.service';
import { CourtService } from './services/court.service';
import { CourtController } from './controllers/court.controller';
import { Court } from '@app/database/entities/court.entity';

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
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AwsModule,
    FfmpegModule,
    PayosModule,
    TwilioModule,
    AgoraModule,
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
          dir: 'dist/apps/api-gateway/src/mail-templates',
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
      Course,
      Enrollment,
      Schedule,
      Request,
      RequestAction,
      Session,
      SessionEarning,
      Attendance,
      Subject,
      Payment,
      Video,
      Quiz,
      Court,
      Lesson,
      Coach,
      Credential,
      Learner,
      Wallet,
      Configuration,
      Bank,
      Achievement,
      EventCountAchievement,
      StreakAchievement,
      QuizAttempt,
      PropertyCheckAchievement,
      AchievementProgress,
      LearnerAchievement,
      AchievementTracking,
      SessionEarning,
      Attendance,
      WalletTransaction,
      Feedback,
      LearnerProgress,
      VideoConference,
      Province,
      District,
      LearnerVideo,
      AiVideoComparisonResult,
    ]),
    ErrorModule,
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
    QuizController,
    CoachController,
    WalletController,
    AchievementController, // Achievement Management
    ConfigurationController,
    CourtController,
    SessionController,
    VideoController,
    LearnerProgressController,
    FeedbackController,
    VideoConferenceController,
    ProvinceController,
    StudentAnalysisController,
    AttendanceController,
    ScheduleController,
    EnrollmentController,
    PlatformAnalysisController,
    LearnerVideoController,
    AiVideoCompareResultController,
  ],
  providers: [
    AppService,
    UserService,
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
    CronService,
    SubjectService,
    LessonService,
    WalletService,
    PaymentService,
    AchievementService,
    AchievementTrackingService,
    EnrollmentService,
    ConfigurationService,
    QuizService,
    VideoService,
    LearnerProgressService,
    FeedbackService,
    CourtService,
    NotificationService,
    VideoConferenceService,
    ProvinceService,
    StudentAnalysisService,
    ScheduleService,
    AttendanceService,
    PlatformAnalysisService,
    LearnerVideoService,
    AiVideoCompareResultService,
  ],
})
export class AppModule {}
