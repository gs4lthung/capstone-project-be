import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';
import { Court } from './court.entity';
import { User } from './user.entity';

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

  @OneToMany(() => User, (user) => user.province)
  users: User[];
}
