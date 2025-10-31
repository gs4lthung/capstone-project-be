import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('errors')
export class Error {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 5000, nullable: true })
  stack: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  body: string;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'resolved_at' })
  resolvedAt: Date;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @ManyToOne(() => User, (user) => user.errors, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@ObjectType()
export class PaginatedError extends PaginatedResource(Error) {}
