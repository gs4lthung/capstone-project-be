import { ChildEntity, Column } from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ChildEntity('EVENT_COUNT')
@ObjectType()
export class EventCountAchievement extends Achievement {
  @Column({ name: 'event_name', type: 'varchar', length: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Field(() => String)
  eventName: string;

  @Column({ name: 'target_count', type: 'int' })
  @IsInt()
  @Min(0)
  @Field(() => Number)
  targetCount: number;
}

@ObjectType()
export class PaginatedEventCountAchievement extends PaginatedResource(EventCountAchievement) {}
