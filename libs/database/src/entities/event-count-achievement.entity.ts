import { ChildEntity, Column } from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

@ChildEntity()
export class EventCountAchievement extends Achievement {
  @Column({ name: 'event_name', type: 'varchar', length: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  eventName: string;

  @Column({ name: 'target_count', type: 'int' })
  @IsInt()
  @Min(0)
  targetCount: number;
}
