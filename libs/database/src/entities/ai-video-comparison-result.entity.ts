import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
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
import { Video } from './video.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

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

@ObjectType()
@Entity('ai_video_comparison_results')
export class AiVideoComparisonResult {
  @Field(() => Number)
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

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => LearnerVideo,
    (learnerVideo) => learnerVideo.aiVideoComparisonResults,
  )
  @JoinColumn({ name: 'learner_video_id' })
  @Index()
  learnerVideo: LearnerVideo;

  @ManyToOne(() => Video, (video) => video.aiVideoComparisonResults)
  @JoinColumn({ name: 'video_id' })
  video: Video;
}

@ObjectType()
export class PaginatedAiVideoComparisonResult extends PaginatedResource(AiVideoComparisonResult) {}
