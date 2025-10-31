import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { User } from './user.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';
import { Bank } from './bank.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
@Entity('wallets')
export class Wallet {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: true })
  @Column({
    name: 'bank_account_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  @IsNotEmpty()
  @IsString()
  bankAccountNumber: string;

  @Field(() => Number)
  @Column({ name: 'current_balance', type: 'bigint', default: 0 })
  currentBalance: number;

  @Field(() => Number)
  @Column({ name: 'total_income', type: 'bigint', default: 0 })
  totalIncome: number;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [WalletTransaction], { nullable: true })
  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];

  @Field(() => [WithdrawalRequest], { nullable: true })
  @OneToMany(
    () => WithdrawalRequest,
    (withdrawalRequest) => withdrawalRequest.wallet,
  )
  withdrawalRequests: WithdrawalRequest[];

  @Field(() => Bank, { nullable: true })
  @ManyToOne(() => Bank, (bank) => bank.wallets, { eager: true })
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedWallet extends PaginatedResource(Wallet) {}
