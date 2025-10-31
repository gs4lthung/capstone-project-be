import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Question } from './question.entity';
import { QuizAttempt } from './quiz_attempt.entity';
import { QuestionOption } from './question-option.entity';
import { IsBoolean } from 'class-validator';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('learner_answers')
export class LearnerAnswer {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Boolean)
  @Column({ name: 'is_correct', type: 'boolean' })
  @IsBoolean()
  isCorrect: boolean;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Question)
  @ManyToOne(() => Question, (question) => question.learnerAnswers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Field(() => QuizAttempt)
  @ManyToOne(() => QuizAttempt, (quizAttempt) => quizAttempt.learnerAnswers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'quiz_attempt_id' })
  quizAttempt: QuizAttempt;

  @Field(() => QuestionOption)
  @ManyToOne(
    () => QuestionOption,
    (questionOption) => questionOption.learnerAnswers,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'question_option_id' })
  questionOption: QuestionOption;
}

@ObjectType()
export class PaginatedLearnerAnswer extends PaginatedResource(LearnerAnswer) {}
