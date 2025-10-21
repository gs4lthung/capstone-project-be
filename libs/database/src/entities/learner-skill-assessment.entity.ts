import { LearnerSkillAssessmentStatus } from '@app/shared/enums/learner.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearnerVideo } from './learner-video.entity';
import { SkillAssessmentTemplate } from './skill-assessment-template.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';

@Entity('learner_skill_assessments')
export class LearnerSkillAssessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LearnerSkillAssessmentStatus,
    default: LearnerSkillAssessmentStatus.IN_PROGRESS,
  })
  @IsEnum(LearnerSkillAssessmentStatus)
  status: LearnerSkillAssessmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.learnerSkillAssessments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => LearnerVideo,
    (learnerVideo) => learnerVideo.learnerSkillAssessments,
  )
  @JoinColumn({ name: 'learner_video_id' })
  learnerVideo: LearnerVideo;

  @ManyToOne(
    () => SkillAssessmentTemplate,
    (skillAssessmentTemplate) =>
      skillAssessmentTemplate.learnerSkillAssessments,
  )
  @JoinColumn({ name: 'skill_assessment_template_id' })
  skillAssessmentTemplate: SkillAssessmentTemplate;

  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.learnerSkillAssessment,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];
}
