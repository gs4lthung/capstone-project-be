import { CoachVideoStatus } from '@app/shared/enums/coach.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import { SessionVideo } from './session-video.entity';

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

  @Column({ name: 'drill_name', type: 'varchar', length: 50, nullable: true })
  drillName: string;

  @Column({ name: 'drill_description', type: 'text', nullable: true })
  drillDescription?: string;

  @Column({ name: 'drill_practice_sets', type: 'text', nullable: true })
  drillPracticeSets?: string;

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

  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.coachVideo,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];

  @OneToMany(() => SessionVideo, (sessionVideo) => sessionVideo.video, {
    cascade: ['insert'],
    nullable: true,
  })
  sessionVideos: SessionVideo[];
}
