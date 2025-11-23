import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@app/config';
import { AiVideoComparisonResult } from '@app/database/entities/ai-video-comparison-result.entity';
import { LearnerVideo } from '@app/database/entities/learner-video.entity';
import { AiVideoCompareResultService } from './ai-video-compare-result.service';
import { AiPoseService } from './ai-pose.service';
import { AiGeminiService } from './ai-gemini.service';
// Controller is registered in app.module.ts, not here

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AiVideoComparisonResult, LearnerVideo]),
  ],
  providers: [AiVideoCompareResultService, AiPoseService, AiGeminiService],
  exports: [
    AiVideoCompareResultService,
    AiPoseService,
    AiGeminiService,
    TypeOrmModule,
  ],
})
export class AiVideoCompareResultModule {}
