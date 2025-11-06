import { ChildEntity, Column } from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@ChildEntity()
export class PropertyCheckAchievement extends Achievement {
  @Column({ name: 'event_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  eventName: string;

  @Column({ name: 'entity_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  entityName: string;

  @Column({ name: 'property_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  propertyName: string;

  @Column({ name: 'comparison_operator', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  comparisonOperator: string;

  @Column({ name: 'target_value', type: 'text' })
  @IsString()
  @IsNotEmpty()
  targetValue: string;
}
