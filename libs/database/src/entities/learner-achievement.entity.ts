import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Achievement } from './achievement.entity';
import { Learner } from './learner.entity';

@Entity('learner_achievements')
export class LearnerAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date;

  @ManyToOne(
    () => Achievement,
    (achievement) => achievement.learnerAchievements,
  )
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @ManyToOne(() => Learner, (learner) => learner.achievements)
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;
}
