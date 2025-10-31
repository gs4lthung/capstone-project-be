import { WithdrawalRequestStatus } from '@app/shared/enums/payment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Wallet } from './wallet.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@ObjectType()
@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({ type: 'bigint' })
  amount: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: WithdrawalRequestStatus,
    default: WithdrawalRequestStatus.PENDING,
  })
  status: WithdrawalRequestStatus;

  @Field(() => String, { nullable: true })
  @Column({ name: 'payout_details', type: 'text', nullable: true })
  payoutDetails?: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'admin_comment', type: 'text', nullable: true })
  adminComment?: string;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @Column({ name: 'completed_at', type: 'date', nullable: true })
  completedAt?: Date;

  @Field(() => Wallet)
  @ManyToOne(() => Wallet, (wallet) => wallet.withdrawalRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Field(() => [WalletTransaction], { nullable: true })
  @OneToMany(
    () => WalletTransaction,
    (transaction) => transaction.withdrawalRequest,
  )
  walletTransactions: WalletTransaction[];
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedWithdrawalRequest extends PaginatedResource(WithdrawalRequest) {}
