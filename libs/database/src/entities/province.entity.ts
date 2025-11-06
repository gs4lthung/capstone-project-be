import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';
import { Course } from './course.entity';
import { Learner } from './learner.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

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
