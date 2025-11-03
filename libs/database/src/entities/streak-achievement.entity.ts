import { ChildEntity, Column } from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';

@ChildEntity()
@ObjectType()
export class StreakAchievement extends Achievement {
  @Field(() => String)
  @Column({ name: 'event_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  eventName: string;

  @Field(() => Number)
  @Column({ name: 'target_streak_length', type: 'int' })
  @IsInt()
  @Min(0)
  targetStreakLength: number;

  @Field(() => String)
  @Column({ name: 'streak_unit', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  streakUnit: string;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedStreakAchievement extends PaginatedResource(
  StreakAchievement,
) {}
