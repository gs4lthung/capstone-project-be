import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearningContent } from './learning-content.entity';
import { Question } from './question.entity';

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

  @OneToOne(() => LearningContent, (learningContent) => learningContent.quiz, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learning_content_id' })
  learningContent: LearningContent;

  @OneToMany(() => Question, (question) => question.id, {
    eager: true,
    cascade: ['insert'],
    nullable: true,
  })
  questions: Question[];
}
