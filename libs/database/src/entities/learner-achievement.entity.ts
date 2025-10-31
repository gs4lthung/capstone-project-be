import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Achievement } from './achievement.entity';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('learner_achievements')
export class LearnerAchievement {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'earned_at' })
  earnedAt: Date;

  @Field(() => Achievement)
  @ManyToOne(
    () => Achievement,
    (achievement) => achievement.learnerAchievements,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.achievements)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@ObjectType()
export class PaginatedLearnerAchievement extends PaginatedResource(LearnerAchievement) {}
