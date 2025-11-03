import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Quiz } from './quiz.entity';
import { QuestionOption } from './question-option.entity';
import { LearnerAnswer } from './learner-answer.entity';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('questions')
export class Question {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @Field(() => Quiz)
  @ManyToOne(() => Quiz, (quiz) => quiz.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Field(() => [QuestionOption], { nullable: true })
  @OneToMany(() => QuestionOption, (option) => option.question, {
    eager: true,
    cascade: ['insert'],
  })
  options: QuestionOption[];

  @Field(() => [LearnerAnswer], { nullable: true })
  @OneToMany(() => LearnerAnswer, (learnerAnswer) => learnerAnswer.question)
  learnerAnswers: LearnerAnswer[];
}

@ObjectType()
export class PaginatedQuestion extends PaginatedResource(Question) {}
