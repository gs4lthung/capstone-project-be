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
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('achievement_progresses')
export class AchievementProgress {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({ name: 'current_progress', type: 'int' })
  @IsInt()
  @Min(0)
  @Max(100)
  currentProgress: number;

  @Field(() => GqlCustomDateTime)
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

@ObjectType()
export class PaginatedAchievementProgress extends PaginatedResource(AchievementProgress) {}
