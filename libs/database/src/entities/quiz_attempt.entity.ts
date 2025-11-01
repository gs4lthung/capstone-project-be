import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Session } from './session.entity';
import { LearnerAnswer } from './learner-answer.entity';
import { User } from './user.entity';

@ObjectType()
@Entity('quiz_attempts')
export class QuizAttempt {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({ name: 'attempt_number', type: 'int' })
  attemptNumber: number;

  @Field(() => Number)
  @Column({ type: 'int' })
  score: number;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.quizAttempts)
  @JoinColumn({ name: 'attempted_by' })
  attemptedBy: User;

  @Field(() => Session)
  @ManyToOne(() => Session, (session) => session.quizAttempts)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Field(() => [LearnerAnswer], { nullable: true })
  @OneToMany(() => LearnerAnswer, (learnerAnswer) => learnerAnswer.quizAttempt)
  learnerAnswers: LearnerAnswer[];
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedQuizAttempt extends PaginatedResource(QuizAttempt) {}
