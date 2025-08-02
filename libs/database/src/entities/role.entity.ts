import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity('roles')
@ObjectType()
export class Role {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Field(() => String)
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
