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
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Course } from './course.entity';
import { IsEnum, IsInt } from 'class-validator';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('learner_progresses')
@Check(`sessions_completed <= total_sessions`)
export class LearnerProgress {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({ name: 'sessions_completed', type: 'int' })
  @IsInt()
  sessionsCompleted: number;

  @Field(() => Number)
  @Column({ name: 'total_sessions', type: 'int' })
  @IsInt()
  totalSessions: number;

  @Field(() => Number)
  @Column({ name: 'avg_ai_analysis_score', type: 'int' })
  avgAiAnalysisScore: number;

  @Field(() => Number)
  @Column({ name: 'avg_quiz_score', type: 'int' })
  avgQuizScore: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: LearnerProgressStatus,
    default: LearnerProgressStatus.IN_PROGRESS,
  })
  @IsEnum(LearnerProgressStatus)
  status: LearnerProgressStatus;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.learnerProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.learnerProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}

@ObjectType()
export class PaginatedLearnerProgress extends PaginatedResource(LearnerProgress) {}
