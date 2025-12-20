import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { WithdrawalRequestStatus } from '@app/shared/enums/payment.enum';

@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 15, scale: 3 })
  amount: number;

  @Column({type:'enum', enum:WithdrawalRequestStatus, default:WithdrawalRequestStatus.PENDING})
  status: WithdrawalRequestStatus;


  @Column({ name: 'admin_comment', type: 'text', nullable: true })
  adminComment?: string;

  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'date', nullable: true })
  updatedAt?: Date;

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
