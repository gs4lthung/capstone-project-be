import { LearnerProgressStatus } from '@app/shared/enums/learner.enum';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { IsEnum, IsInt } from 'class-validator';
import { User } from './user.entity';

@Entity('learner_progresses')
@Check(`sessions_completed <= total_sessions`)
export class LearnerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sessions_completed', type: 'int' })
  @IsInt()
  sessionsCompleted: number;

  @Column({ name: 'total_sessions', type: 'int' })
  @IsInt()
  totalSessions: number;

  @Column({ name: 'avg_ai_analysis_score', type: 'int' })
  avgAiAnalysisScore: number;

  @Column({ name: 'avg_quiz_score', type: 'int' })
  avgQuizScore: number;

  @Column({
    type: 'enum',
    enum: LearnerProgressStatus,
    default: LearnerProgressStatus.IN_PROGRESS,
  })
  @IsEnum(LearnerProgressStatus)
  status: LearnerProgressStatus;

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
}
