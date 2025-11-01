import { WalletTransactionType } from '@app/shared/enums/payment.enum';
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
import { Wallet } from './wallet.entity';
import { Session } from './session.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';

@ObjectType()
@Entity('wallet_transactions')
export class WalletTransaction {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({ type: 'int' })
  amount: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Wallet)
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Field(() => Session, { nullable: true })
  @ManyToOne(() => Session, (session) => session.transactions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Field(() => WithdrawalRequest, { nullable: true })
  @ManyToOne(
    () => WithdrawalRequest,
    (withdrawalRequest) => withdrawalRequest.walletTransactions,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'withdrawal_request_id' })
  withdrawalRequest: WithdrawalRequest;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedWalletTransaction extends PaginatedResource(WalletTransaction) {}
