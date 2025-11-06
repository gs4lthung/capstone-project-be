import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsInt, Max, Min } from 'class-validator';
import { User } from './user.entity';

@Entity('achievement_progresses')
export class AchievementProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'current_progress', type: 'int' })
  @IsInt()
  @Min(0)
  @Max(100)
  currentProgress: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => Achievement,
    (achievement) => achievement.achievementProgresses,
  )
  @JoinColumn({ name: 'achievement_id' })
  @Index()
  achievement: Achievement;

  @ManyToOne(() => User, (user) => user.achievementProgresses)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;
}
