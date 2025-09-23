import { Module } from '@nestjs/common';
import { LearnerServiceController } from './learner-service.controller';
import { LearnerServiceService } from './learner-service.service';
import { ConfigModule } from '@app/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { LearnerProfile } from '@app/database/entities/learner-profile.entity';
import { RedisModule } from '@app/redis';
import { Role } from '@app/database/entities/role.entity';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User, LearnerProfile, Role]),
    RedisModule,
  ],
  controllers: [LearnerServiceController],
  providers: [LearnerServiceService],
})
export class LearnerServiceModule {}
