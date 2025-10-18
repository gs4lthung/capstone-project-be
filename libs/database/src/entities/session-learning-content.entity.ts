import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearningContent } from './learning-content.entity';
import { Session } from './session.entity';

@Entity('session_learning_contents')
export class SessionLearningContent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => LearningContent,
    (learningContent) => learningContent.sessionLearningContents,
    {
      onDelete: 'CASCADE',
      eager: true,
    },
  )
  @JoinColumn({ name: 'learning_content_id' })
  learningContent: LearningContent;

  @ManyToOne(() => Session, (session) => session.sessionLearningContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
