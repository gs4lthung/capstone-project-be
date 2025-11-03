import { ChildEntity, Column } from 'typeorm';
import { Achievement } from './achievement.entity';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ChildEntity('PROPERTY_CHECK')
@ObjectType()
export class PropertyCheckAchievement extends Achievement {
  @Field(() => String)
  @Column({ name: 'event_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  eventName: string;

  @Field(() => String)
  @Column({ name: 'entity_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  entityName: string;

  @Field(() => String)
  @Column({ name: 'property_name', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  propertyName: string;

  @Field(() => String)
  @Column({ name: 'comparison_operator', type: 'varchar', length: 25 })
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  comparisonOperator: string;

  @Field(() => String)
  @Column({ name: 'target_value', type: 'text' })
  @IsString()
  @IsNotEmpty()
  targetValue: string;
}

@ObjectType()
export class PaginatedPropertyCheckAchievement extends PaginatedResource(PropertyCheckAchievement) {}
