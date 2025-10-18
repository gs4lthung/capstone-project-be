import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { RequestAction } from './request-action.entity';
import { Configuration } from './configuration.entity';
import { SkillAssessmentTemplate } from './skill-assessment-template.entity';
import { Achievement } from './achievement.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @OneToMany(() => RequestAction, (requestAction) => requestAction.handledBy)
  requestActions: RequestAction[];

  @OneToMany(() => Configuration, (config) => config.created_by)
  createdConfigurations: Configuration[];

  @OneToMany(() => Configuration, (config) => config.updated_by)
  updatedConfigurations: Configuration[];

  @OneToMany(
    () => SkillAssessmentTemplate,
    (skillAssessmentTemplate) => skillAssessmentTemplate.createdBy,
  )
  createdSkillAssessmentTemplates: SkillAssessmentTemplate[];

  @OneToMany(() => Achievement, (achievement) => achievement.createdBy)
  createdAchievements: Achievement[];
}
