import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { LearnerProgress } from './learner-progress.entity';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum RecommendationPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

class QuizPerformanceAnalysis {
  @IsNumber()
  averageScore: number;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsArray()
  @IsString({ each: true })
  topicsMastered: string[];

  @IsArray()
  @IsString({ each: true })
  topicsNeedingReview: string[];
}

class VideoPerformanceAnalysis {
  @IsNumber()
  averageScore: number;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsArray()
  @IsString({ each: true })
  techniqueStrengths: string[];

  @IsArray()
  @IsString({ each: true })
  techniqueWeaknesses: string[];
}

class Recommendation {
  @IsEnum(RecommendationPriority)
  priority: RecommendationPriority;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  focusAreas: string[];
}

class PracticeDrill {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  targetArea: string;

  @IsString()
  @IsNotEmpty()
  sets: string;
}

@Entity('ai_learner_progress_analyses')
export class AiLearnerProgressAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  overallSummary: string;

  @Column({ name: 'progress_percentage', type: 'int' })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @Column({ name: 'strengths_identified', type: 'json' })
  @IsArray()
  @IsString({ each: true })
  strengthsIdentified: string[];

  @Column({ name: 'areas_for_improvement', type: 'json' })
  @IsArray()
  @IsString({ each: true })
  areasForImprovement: string[];

  @Column({ name: 'quiz_performance_analysis', type: 'json' })
  @ValidateNested()
  @Type(() => QuizPerformanceAnalysis)
  quizPerformanceAnalysis: QuizPerformanceAnalysis;

  @Column({ name: 'video_performance_analysis', type: 'json' })
  @ValidateNested()
  @Type(() => VideoPerformanceAnalysis)
  videoPerformanceAnalysis: VideoPerformanceAnalysis;

  @Column({ name: 'recommendations_for_next_session', type: 'json' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Recommendation)
  recommendationsForNextSession: Recommendation[];

  @Column({ name: 'practice_drills', type: 'json' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticeDrill)
  practiceDrills: PracticeDrill[];

  @Column({ name: 'motivational_message', type: 'text' })
  @IsString()
  @IsNotEmpty()
  motivationalMessage: string;

  @Column({ name: 'sessions_completed_at_analysis', type: 'int' })
  @IsInt()
  sessionsCompletedAtAnalysis: number;

  @Column({ name: 'total_sessions_at_analysis', type: 'int' })
  @IsInt()
  totalSessionsAtAnalysis: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.aiLearnerProgressAnalyses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => LearnerProgress,
    (learnerProgress) => learnerProgress.aiLearnerProgressAnalyses,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'learner_progress_id' })
  learnerProgress: LearnerProgress;
}
