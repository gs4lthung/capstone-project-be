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
import { Learner } from './learner.entity';
import { LearnerVideo } from './learner-video.entity';
import { SkillAssessmentTemplate } from './skill-assessment-template.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import { IsEnum } from 'class-validator';

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

  @ManyToOne(() => Learner, (learner) => learner.learnerSkillAssessments)
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;

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
