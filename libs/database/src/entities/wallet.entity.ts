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
import { User } from './user.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';
import { Bank } from './bank.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'bank_account_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  @IsNotEmpty()
  @IsString()
  bankAccountNumber: string;

  @Column({ name: 'current_balance', type: 'bigint', default: 0 })
  currentBalance: number;

  @Column({ name: 'total_income', type: 'bigint', default: 0 })
  totalIncome: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];

  @OneToMany(
    () => WithdrawalRequest,
    (withdrawalRequest) => withdrawalRequest.wallet,
  )
  withdrawalRequests: WithdrawalRequest[];

  @ManyToOne(() => Bank, (bank) => bank.wallets, { eager: true })
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;
}
