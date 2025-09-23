import {
  PickleBallAssessMethod,
  PickleBallLevelEnum,
} from '@app/shared/enums/pickleball.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LearnerProfile } from './learner-profile.entity';

@Entity('skill_assessments')
export class SkillAssessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PickleBallLevelEnum })
  assessedLevel: PickleBallLevelEnum;

  @Column({ type: 'enum', enum: PickleBallAssessMethod })
  method: PickleBallAssessMethod;

  @CreateDateColumn()
  assessedAt: Date;

  @OneToOne(() => LearnerProfile, (learner) => learner.skillAssessment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learnerId' })
  learner: LearnerProfile;
}
