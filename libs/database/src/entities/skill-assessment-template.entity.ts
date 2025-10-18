import { SkillAssessmentStatus } from '@app/shared/enums/skill-assessment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { LearnerSkillAssessment } from './learner-skill-assessment.entity';

@Entity('skill_assessment_templates')
export class SkillAssessmentTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SkillAssessmentStatus,
    default: SkillAssessmentStatus.DRAFT,
  })
  status: SkillAssessmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Admin, (admin) => admin.createdSkillAssessmentTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: Admin;

  @OneToMany(
    () => LearnerSkillAssessment,
    (learnerSkillAssessment) => learnerSkillAssessment.skillAssessmentTemplate,
  )
  learnerSkillAssessments: LearnerSkillAssessment[];
}
