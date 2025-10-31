import { RequestActionType } from '@app/shared/enums/request.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Request } from './request.entity';
import { User } from './user.entity';

@ObjectType()
@Entity('request_actions')
export class RequestAction {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'enum', enum: RequestActionType })
  type: RequestActionType;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  comment: string;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.requestActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'handled_by' })
  handledBy: User;

  @Field(() => Request)
  @ManyToOne(() => Request, (request) => request.actions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: Request;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedRequestAction extends PaginatedResource(RequestAction) {}
