import {
  BeforeInsert,
  BeforeUpdate,
  Check,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { Session } from './session.entity';

@Entity('quizzes')
@Check(
  `("lesson_id" IS NOT NULL AND "session_id" IS NULL) OR ("lesson_id" IS NULL AND "session_id" IS NOT NULL)`,
)
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions: number;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalQuestions() {
    if (this.questions && this.questions.length > 0) {
      this.totalQuestions = this.questions.length;
    }
  }

  @OneToMany(() => Question, (question) => question.quiz, {
    eager: true,
    cascade: ['insert'],
  })
  questions: Question[];

  @ManyToOne(() => User, (user) => user.quizzes, {
    eager: true,
  })
  createdBy: User;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToOne(() => Lesson, (lesson) => lesson.quiz, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToOne(() => Session, (session) => session.quiz, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
