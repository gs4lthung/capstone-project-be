import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';
import { Learner } from './learner.entity';
import { Court } from './court.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => District, (district) => district.province, {
    cascade: ['insert'],
  })
  districts: District[];

  @OneToMany(() => Court, (court) => court.province)
  courts: Court[];

  @OneToMany(() => Learner, (learner) => learner.province)
  learners: Learner[];
}
