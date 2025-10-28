import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearnerVideo } from './learner-video.entity';

import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SessionVideo } from './session-video.entity';

enum AiVideoComparisonDetailsType {
  PREPARATION = 'PREPARATION',
  SWING_AND_CONTACT = 'SWING_AND_CONTACT',
  FOLLOW_THROUGH = 'FOLLOW_THROUGH',
}

class AiVideoComparisonDetails {
  @IsEnum(AiVideoComparisonDetailsType)
  type: AiVideoComparisonDetailsType;

  @IsString()
  @IsNotEmpty()
  advanced: string;

  @IsEnum(['LEARNER', 'COACH'])
  userRole: string;

  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  strengths?: string[];

  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  weaknesses?: string[];
}

class AiVideoComparisonRecommendationDrill {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  practiceSets?: string;
}

class AiVideoComparisonKeyDifferent {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  aspect: string;

  @IsString()
  @IsNotEmpty()
  impact: string;

  @IsString()
  @IsNotEmpty()
  coachTechnique: string;

  @IsString()
  @IsNotEmpty()
  learnerTechnique: string;
}

@Entity('ai_video_comparison_results')
export class AiVideoComparisonResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  summary?: string;

  @Column({ name: 'learner_score', type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  learnerScore?: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiVideoComparisonKeyDifferent)
  keyDifferents?: AiVideoComparisonKeyDifferent[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiVideoComparisonDetails)
  details?: AiVideoComparisonDetails[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiVideoComparisonRecommendationDrill)
  recommendationDrills?: AiVideoComparisonRecommendationDrill[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => LearnerVideo,
    (learnerVideo) => learnerVideo.aiVideoComparisonResults,
  )
  @JoinColumn({ name: 'learner_video_id' })
  @Index()
  learnerVideo: LearnerVideo;

  @ManyToOne(() => SessionVideo, (video) => video.aiVideoComparisonResults)
  @JoinColumn({ name: 'session_video_id' })
  @Index()
  session: SessionVideo;
}
