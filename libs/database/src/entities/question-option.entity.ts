import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { LearnerAnswer } from './learner-answer.entity';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
@Entity('question_options')
export class QuestionOption {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'text' })
  @IsString()
  content: string;

  @Field(() => Boolean)
  @Column({ name: 'is_correct', type: 'boolean', default: false })
  @IsBoolean()
  isCorrect: boolean;

  @Field(() => Question)
  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Field(() => [LearnerAnswer], { nullable: true })
  @OneToMany(() => LearnerAnswer, (learnerAnswer) => learnerAnswer.question)
  learnerAnswers: LearnerAnswer[];
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedQuestionOption extends PaginatedResource(
  QuestionOption,
) {}
