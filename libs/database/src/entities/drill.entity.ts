import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearningContent } from './learning-content.entity';

@Entity('drills')
export class Drill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'practice_sets', type: 'text', nullable: true })
  practiceSets?: string;

  @OneToOne(() => LearningContent, (learningContent) => learningContent.drill, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learning_content_id' })
  learningContent: LearningContent;
}
