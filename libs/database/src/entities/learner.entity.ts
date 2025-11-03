import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';
import { Province } from './province.entity';
import { District } from './district.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('learners')
export class Learner {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({
    name: 'skill_level',
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  skillLevel: PickleballLevel;

  @Field(() => String)
  @Column({
    name: 'learning_goal',
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  learningGoal: PickleballLevel;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.learner, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Province)
  @ManyToOne(() => Province, (province) => province.learners)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Field(() => District)
  @ManyToOne(() => District, (district) => district.learners)
  @JoinColumn({ name: 'district_id' })
  district: District;
}

@ObjectType()
export class PaginatedLearner extends PaginatedResource(Learner) {}
