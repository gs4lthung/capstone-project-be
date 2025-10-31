import { ChildEntity, Column } from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

@ChildEntity('STREAK')
export class StreakAchievement extends Achievement {
  @Column({ name: 'event_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  eventName: string;

  @Column({ name: 'target_streak_length', type: 'int' })
  @IsInt()
  @Min(0)
  targetStreakLength: number;

  @Column({ name: 'streak_unit', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  streakUnit: string;
}
