import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuestionOption } from './question-option.entity';
import { LearnerAnswer } from './learner-answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @OneToMany(() => QuestionOption, (option) => option.question, {
    eager: true,
    cascade: ['insert'],
    nullable: true,
  })
  options: QuestionOption[];

  @OneToMany(() => LearnerAnswer, (learnerAnswer) => learnerAnswer.question)
  learnerAnswers: LearnerAnswer[];
}
