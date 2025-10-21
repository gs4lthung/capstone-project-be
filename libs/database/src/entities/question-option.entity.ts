import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { LearnerAnswer } from './learner-answer.entity';
import { IsBoolean, IsString } from 'class-validator';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsString()
  content: string;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  @IsBoolean()
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @OneToMany(() => LearnerAnswer, (learnerAnswer) => learnerAnswer.question)
  learnerAnswers: LearnerAnswer[];
}
