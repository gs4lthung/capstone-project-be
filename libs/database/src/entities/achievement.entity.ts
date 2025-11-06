import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

import { AchievementProgress } from './achievement-progress.entity';
import { LearnerAchievement } from './learner-achievement.entity';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from './user.entity';

enum AchievementType {
  EVENT_COUNT = 'EVENT_COUNT',
  PROPERTY_CHECK = 'PROPERTY_CHECK',
  STREAK = 'STREAK',
}

@Entity('achievements')
@TableInheritance({ column: { type: 'enum', enum: AchievementType } })
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(
    () => AchievementProgress,
    (achievementProgress) => achievementProgress.achievement,
  )
  achievementProgresses: AchievementProgress[];

  @OneToMany(() => LearnerAchievement, (achievement) => achievement.achievement)
  learnerAchievements: LearnerAchievement[];

  @ManyToOne(() => User, (user) => user.achievements)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
