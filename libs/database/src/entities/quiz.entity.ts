import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Question } from './question.entity';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { Session } from './session.entity';
@ObjectType()
@Entity('quizzes')
@Check(
  `("lesson_id" IS NOT NULL AND "session_id" IS NULL) OR ("lesson_id" IS NULL AND "session_id" IS NOT NULL)`,
)
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
  @ManyToOne(() => Lesson, (lesson) => lesson.quizzes, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Session, (session) => session.quizzes, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}

@ObjectType()
export class PaginatedQuiz extends PaginatedResource(Quiz) {}
