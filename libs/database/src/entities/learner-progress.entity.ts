import { LearnerProgressStatus } from '@app/shared/enums/learner.enum';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { IsEnum, IsInt } from 'class-validator';
import { User } from './user.entity';
import { AiLearnerProgressAnalysis } from './ai-learner-progress-analysis.entity';

@Entity('learner_progresses')
@Check(`sessions_completed <= total_sessions`)
export class LearnerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sessions_completed', type: 'int', default: 0 })
  @IsInt()
  sessionsCompleted: number;

  @Column({ name: 'total_sessions', type: 'int' })
  @IsInt()
  totalSessions: number;

  @Column({ name: 'avg_ai_analysis_score', type: 'int', default: 0 })
  avgAiAnalysisScore: number;

  @Column({ name: 'avg_quiz_score', type: 'int', default: 0 })
  avgQuizScore: number;

  @Column({ name: 'can_generate_ai_analysis', type: 'boolean', default: false })
  canGenerateAIAnalysis: boolean;

  @Column({
    type: 'enum',
    enum: LearnerProgressStatus,
    default: LearnerProgressStatus.IN_PROGRESS,
  })
  @IsEnum(LearnerProgressStatus)
  status: LearnerProgressStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.learnerProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.learnerProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(
    () => AiLearnerProgressAnalysis,
    (aiLearnerProgressAnalysis) => aiLearnerProgressAnalysis.learnerProgress,
  )
  aiLearnerProgressAnalyses: AiLearnerProgressAnalysis[];
}
