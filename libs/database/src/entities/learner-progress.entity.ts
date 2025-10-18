import { LearnerProgressStatus } from '@app/shared/enums/learner.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Learner } from './learner.entity';
import { Course } from './course.entity';

@Entity('learner_progresses')
export class LearnerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sessions_completed', type: 'int' })
  sessionsCompleted: number;

  @Column({ name: 'total_sessions', type: 'int' })
  totalSessions: number;

  @Column({ name: 'avg_quiz_score', type: 'int' })
  avgQuizScore: number;

  @Column({
    type: 'enum',
    enum: LearnerProgressStatus,
    default: LearnerProgressStatus.IN_PROGRESS,
  })
  status: LearnerProgressStatus;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Learner, (learner) => learner.learnerProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;

  @ManyToOne(() => Course, (course) => course.learnerProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
