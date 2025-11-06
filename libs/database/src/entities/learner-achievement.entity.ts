import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Achievement } from './achievement.entity';
import { User } from './user.entity';

@Entity('learner_achievements')
export class LearnerAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date;

  @ManyToOne(
    () => Achievement,
    (achievement) => achievement.learnerAchievements,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @ManyToOne(() => User, (user) => user.achievements)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
