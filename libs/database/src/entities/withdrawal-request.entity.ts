import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  referenceId: string;

  @Column({ type: 'numeric', precision: 15, scale: 3 })
  amount: number;

  @Column({ name: 'payout_details', type: 'text', nullable: true })
  payoutDetails?: string;

  @Column({ name: 'admin_comment', type: 'text', nullable: true })
  adminComment?: string;

  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @Column({ name: 'completed_at', type: 'date', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.withdrawalRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @OneToMany(
    () => WalletTransaction,
    (transaction) => transaction.withdrawalRequest,
  )
  walletTransactions: WalletTransaction[];
}
