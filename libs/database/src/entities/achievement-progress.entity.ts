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
import { Learner } from './learner.entity';
import { IsInt, Max, Min } from 'class-validator';

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

  @ManyToOne(() => Learner, (learner) => learner.achievementProgresses)
  @JoinColumn({ name: 'learner_id' })
  @Index()
  learner: Learner;
}
