import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Province } from './province.entity';
import { Course } from './course.entity';
import { Learner } from './learner.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('districts')
export class District {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => Province, (province) => province.districts)
  province: Province;

  @OneToMany(() => Course, (course) => course.district)
  courses: Course[];

  @OneToMany(() => Learner, (learner) => learner.district)
  learners: Learner[];
}

@ObjectType()
export class PaginatedDistrict extends PaginatedResource(District) {}
