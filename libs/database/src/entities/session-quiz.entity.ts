import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Session } from './session.entity';

@Entity('session_quizzes')
export class SessionQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Session, (session) => session.sessionQuizzes, {
    onDelete: 'CASCADE',
  })
  session: Session;

  @ManyToOne(() => Quiz, (quiz) => quiz.sessionQuizzes, {
    onDelete: 'CASCADE',
  })
  quiz: Quiz;
}
