import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@app/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Error } from './entities/error.entity';
import { AuthProvider } from './entities/auth-provider.entity';
import { FcmToken } from './entities/fcm-token.entity';
import { Notification } from './entities/notification.entity';
import { Order } from './entities/order.entity';
import { Role } from './entities/role.entity';
import { Video } from './entities/video.entity';
import { CoachProfile } from './entities/coach-profile.entity';
import { CoachCredential } from './entities/coach-credential.entity';
import { CoachPackage } from './entities/coach-packages.entity';
import { LearnerProfile } from './entities/learner-profile.entity';
import { SkillAssessment } from './entities/skill-assessments.entity';

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
          User,
          Error,
          AuthProvider,
          FcmToken,
          Notification,
          Order,
          Role,
          Video,
          CoachProfile,
          CoachCredential,
          CoachPackage,
          LearnerProfile,
          SkillAssessment,
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
