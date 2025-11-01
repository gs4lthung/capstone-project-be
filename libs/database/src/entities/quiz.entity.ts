import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

@ObjectType()
@Entity('quizzes')
export class Quiz {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Number)
  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions: number;

  @Field(() => [Question], { nullable: true })
  @OneToMany(() => Question, (question) => question.quiz, {
    eager: true,
    cascade: ['insert'],
  })
  questions: Question[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.quizzes, {
    eager: true,
  })
  createdBy: User;

  @Field(() => Lesson, { nullable: true })
  @OneToOne(() => Lesson, (lesson) => lesson.quiz)
  lesson: Lesson;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedQuiz extends PaginatedResource(Quiz) {}
