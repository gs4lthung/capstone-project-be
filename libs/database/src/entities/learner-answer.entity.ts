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

@Entity('learner_answers')
export class LearnerAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'selected_option_id', type: 'int' })
  selectedOptionId: number;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Question, (question) => question.learnerAnswers)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => QuizAttempt, (quizAttempt) => quizAttempt.learnerAnswers)
  @JoinColumn({ name: 'quiz_attempt_id' })
  quizAttempt: QuizAttempt;
}
