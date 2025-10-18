import { CoachVideoStatus } from '@app/shared/enums/coach.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearningContent } from './learning-content.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  tags?: string[];

  @Column({ type: 'int' })
  duration: number;

  @Column({ name: 'public_url', type: 'text' })
  publicUrl: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Column({
    type: 'enum',
    enum: CoachVideoStatus,
    default: CoachVideoStatus.UPLOADING,
  })
  status: CoachVideoStatus;

  @OneToOne(() => LearningContent, (learningContent) => learningContent.video)
  @JoinColumn({ name: 'learning_content_id' })
  learningContent: LearningContent;

  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.coachVideo,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];
}
