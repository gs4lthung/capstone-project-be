import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Learner } from './learner.entity';
import { Session } from './session.entity';
import { LearnerAnswer } from './learner-answer.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'attempt_number', type: 'int' })
  attemptNumber: number;

  @Column({ type: 'int' })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Learner, (learner) => learner.quizAttempts)
  @JoinColumn({ name: 'attempted_by' })
  attemptedBy: Learner;

  @ManyToOne(() => Session, (session) => session.quizAttempts)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @OneToMany(() => LearnerAnswer, (learnerAnswer) => learnerAnswer.quizAttempt)
  learnerAnswers: LearnerAnswer[];
}
