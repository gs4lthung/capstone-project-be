import { LearningContentType } from '@app/shared/enums/learning-content.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Drill } from './drill.entity';
import { Quiz } from './quiz.entity';
import { User } from './user.entity';
import { SessionLearningContent } from './session-learning-content.entity';
import { Video } from './video.entity';

@Entity('learning_contents')
export class LearningContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LearningContentType })
  type: LearningContentType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.learningContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToOne(() => Video, (video) => video.learningContent, {
    eager: true,
    nullable: true,
  })
  video: Video;

  @OneToOne(() => Drill, (drill) => drill.learningContent, {
    eager: true,
    nullable: true,
  })
  drill: Drill;

  @OneToOne(() => Quiz, (quiz) => quiz.learningContent, {
    eager: true,
    nullable: true,
  })
  quiz: Quiz;

  @OneToMany(() => SessionLearningContent, (slc) => slc.learningContent)
  sessionLearningContents: SessionLearningContent[];
}
