import { WalletTransactionType } from '@app/shared/enums/payment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Session } from './session.entity';
import { WithdrawalRequest } from './withdrawal-request.entity';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ManyToOne(() => Session, (session) => session.transactions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

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
