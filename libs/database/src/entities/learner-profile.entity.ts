import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PickleBallLevelEnum } from '@app/shared/enums/pickleball.enum';
import { SkillAssessment } from './skill-assessments.entity';

@Entity('learner_profiles')
export class LearnerProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.learnerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @Column({
    type: 'enum',
    enum: PickleBallLevelEnum,
    default: PickleBallLevelEnum.BEGINNER_1_0,
  })
  pickleballLevel: PickleBallLevelEnum;

  @Column({
    type: 'enum',
    enum: PickleBallLevelEnum,
    default: PickleBallLevelEnum.BEGINNER_1_0,
  })
  pickleballLearnerGoal: PickleBallLevelEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => SkillAssessment, (assessment) => assessment.learner, {
    cascade: true,
    eager: true,
  })
  skillAssessment: SkillAssessment;
}
