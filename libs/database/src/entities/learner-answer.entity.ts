import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { QuizAttempt } from './quiz_attempt.entity';
import { QuestionOption } from './question-option.entity';
import { IsBoolean } from 'class-validator';

@Entity('learner_answers')
export class LearnerAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'is_correct', type: 'boolean' })
  @IsBoolean()
  isCorrect: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Question, (question) => question.learnerAnswers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => QuizAttempt, (quizAttempt) => quizAttempt.learnerAnswers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'quiz_attempt_id' })
  quizAttempt: QuizAttempt;

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
