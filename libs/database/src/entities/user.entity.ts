import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Error } from './error.entity';
import { Role } from './role.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ type: 'varchar', length: 50 })
  @Field(() => String)
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Field(() => String)
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Error, (error) => error.user)
  errors: Error[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
