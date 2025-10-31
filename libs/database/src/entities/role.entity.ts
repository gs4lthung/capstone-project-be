import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity('roles')
export class Role {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedRole extends PaginatedResource(Role) {}
