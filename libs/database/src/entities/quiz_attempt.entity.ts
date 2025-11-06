import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Session } from './session.entity';
import { LearnerAnswer } from './learner-answer.entity';
import { User } from './user.entity';

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

  @ManyToOne(() => User, (user) => user.quizAttempts)
  @JoinColumn({ name: 'attempted_by' })
  attemptedBy: User;

  @ManyToOne(() => Session, (session) => session.quizAttempts)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @OneToMany(
    () => LearnerAnswer,
    (learnerAnswer) => learnerAnswer.quizAttempt,
    {
      cascade: ['insert', 'update'],
    },
  )
  learnerAnswers: LearnerAnswer[];
}
