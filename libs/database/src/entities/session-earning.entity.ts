import { SessionEarningStatus } from '@app/shared/enums/session.enum';
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
import { Session } from './session.entity';

@ObjectType()
@Entity('session_earnings')
export class SessionEarning {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({
    name: 'session_price',
    type: 'numeric',
    precision: 15,
    scale: 3,
  })
  sessionPrice: number;

  @Field(() => Number)
  @Column({
    name: 'coach_earning_total',
    type: 'numeric',
    precision: 15,
    scale: 3,
  })
  coachEarningTotal: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: SessionEarningStatus,
    default: SessionEarningStatus.PENDING,
  })
  status: SessionEarningStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @Column({ name: 'paid_at', type: 'date', nullable: true })
  paidAt?: Date;

  @Field(() => Session)
  @ManyToOne(() => Session, (session) => session.sessionEarnings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedSessionEarning extends PaginatedResource(
  SessionEarning,
) {}
