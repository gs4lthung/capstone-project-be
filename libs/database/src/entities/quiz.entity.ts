import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  level: PickleballLevel;

  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions: number;

  @OneToMany(() => Question, (question) => question.id, {
    eager: true,
    cascade: ['insert'],
    nullable: true,
  })
  questions: Question[];

  @ManyToOne(() => User, (user) => user.quizzes, {
    eager: true,
  })
  createdBy: User;

  @OneToOne(() => Lesson, (lesson) => lesson.quiz)
  lesson: Lesson;
}
