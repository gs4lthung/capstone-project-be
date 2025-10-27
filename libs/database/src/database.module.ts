import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@app/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Error } from './entities/error.entity';
import { AuthProvider } from './entities/auth-provider.entity';
import { Notification } from './entities/notification.entity';
import { Role } from './entities/role.entity';
import { Achievement } from './entities/achievement.entity';
import { AchievementProgress } from './entities/achievement-progress.entity';
import { AiVideoComparisonResult } from './entities/ai-video-comparison-result.entity';
import { Attendance } from './entities/attendance.entity';
import { Coach } from './entities/coach.entity';
import { Configuration } from './entities/configuration.entity';
import { Course } from './entities/course.entity';
import { Credential } from './entities/credential.entity';
import { Enrollment } from './entities/enrollment.entity';
import { EventCountAchievement } from './entities/event-count-achievement.entity';
import { Feedback } from './entities/feedback.entity';
import { Learner } from './entities/learner.entity';
import { LearnerAchievement } from './entities/learner-achievement.entity';
import { LearnerAnswer } from './entities/learner-answer.entity';
import { LearnerProgress } from './entities/learner-progress.entity';
import { LearnerVideo } from './entities/learner-video.entity';
import { Note } from './entities/note.entity';
import { Payment } from './entities/payment.entity';
import { PropertyCheckAchievement } from './entities/property-check-achievement.entity';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { QuizAttempt } from './entities/quiz_attempt.entity';
import { Request } from './entities/request.entity';
import { RequestAction } from './entities/request-action.entity';
import { Schedule } from './entities/schedule.entity';
import { Session } from './entities/session.entity';
import { SessionEarning } from './entities/session-earning.entity';
import { StreakAchievement } from './entities/streak-achievement.entity';
import { Wallet } from './entities/wallet.entity';
import { Video } from './entities/video.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WithdrawalRequest } from './entities/withdrawal-request.entity';
import { SessionQuiz } from './entities/session-quiz.entity';
import { SessionVideo } from './entities/session-video.entity';
import { VideoConferencePresenceLog } from './entities/video-conference-presence-log.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database').host,
        port: configService.get('database').port,
        username: configService.get('database').username,
        password: configService.get('database').password,
        database: configService.get('database').database,
        entities: [
          Achievement,
          AchievementProgress,
          AiVideoComparisonResult,
          Attendance,
          AuthProvider,
          Coach,
          Configuration,
          Course,
          Credential,
          Enrollment,
          Error,
          EventCountAchievement,
          Feedback,
          Learner,
          LearnerAchievement,
          LearnerAnswer,
          LearnerProgress,
          LearnerVideo,
          Note,
          Notification,
          Payment,
          PropertyCheckAchievement,
          Quiz,
          Question,
          QuestionOption,
          QuizAttempt,
          Request,
          RequestAction,
          Role,
          Schedule,
          Session,
          SessionQuiz,
          SessionVideo,
          SessionEarning,
          StreakAchievement,
          User,
          Video,
          WalletTransaction,
          WithdrawalRequest,
          Wallet,
          VideoConferencePresenceLog,
        ],
        logging: false,
        synchronize: configService.get('node_env') === 'dev',
        ssl:
          configService.get('node_env') !== 'dev'
            ? { rejectUnauthorized: false }
            : false,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
