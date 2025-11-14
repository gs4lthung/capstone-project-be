import { CoachVideoStatus } from '@app/shared/enums/coach.enum';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import { Session } from './session.entity';
import { LearnerVideo } from './learner-video.entity';

@Entity('videos')
@Check(
  `("lesson_id" IS NOT NULL AND "session_id" IS NULL) OR ("lesson_id" IS NULL AND "session_id" IS NOT NULL)`,
)
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

  @Column({ name: 'drill_name', type: 'varchar', length: 50, nullable: true })
  drillName: string;

  @Column({ name: 'drill_description', type: 'text', nullable: true })
  drillDescription?: string;

  @Column({ name: 'drill_practice_sets', type: 'text', nullable: true })
  drillPracticeSets?: string;

  @Column({ name: 'public_url', type: 'text', nullable: true })
  publicUrl?: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Column({
    type: 'enum',
    enum: CoachVideoStatus,
    default: CoachVideoStatus.UPLOADING,
  })
  status: CoachVideoStatus;

  @ManyToOne(() => User, (user) => user.videos, {
    eager: true,
  })
  uploadedBy: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.videos, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Session, (session) => session.videos, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @OneToMany(() => LearnerVideo, (LearnerVideo) => LearnerVideo.video)
  learnerVideos: LearnerVideo[];

  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.video,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];
}
