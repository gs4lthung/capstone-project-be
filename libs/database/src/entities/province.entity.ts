import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';
import { Course } from './course.entity';
import { Learner } from './learner.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('provinces')
export class Province {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => District, (district) => district.province, {
    eager: true,
    cascade: ['insert'],
  })
  districts: District[];

  @OneToMany(() => Course, (course) => course.district)
  courses: Course[];

  @OneToMany(() => Learner, (learner) => learner.province)
  learners: Learner[];
}

@ObjectType()
export class PaginatedProvince extends PaginatedResource(Province) {}
