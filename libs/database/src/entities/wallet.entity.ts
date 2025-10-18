import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'current_balance', type: 'bigint' })
  currentBalance: number;

  @Column({ name: 'total_income', type: 'bigint' })
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
}
