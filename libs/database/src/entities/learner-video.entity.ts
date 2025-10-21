import { LearnerVideoStatus } from '@app/shared/enums/learner.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Learner } from './learner.entity';
import { Session } from './session.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import { LearnerSkillAssessment } from './learner-skill-assessment.entity';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

@Entity('learner_videos')
export class LearnerVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @Column({ type: 'int' })
  @IsInt()
  duration: number;

  @Column({ name: 'public_url', type: 'text' })
  @IsUrl()
  publicUrl: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @Column({
    type: 'enum',
    enum: LearnerVideoStatus,
    default: LearnerVideoStatus.UPLOADING,
  })
  @IsEnum(LearnerVideoStatus)
  status: LearnerVideoStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Learner, (learner) => learner.learnerVideos)
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;

  @ManyToOne(() => Session, (session) => session.learnerVideos)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.learnerVideo,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];

  @OneToMany(
    () => LearnerSkillAssessment,
    (learnerSkillAssessment) => learnerSkillAssessment.learnerVideo,
  )
  learnerSkillAssessments: LearnerSkillAssessment[];
}
