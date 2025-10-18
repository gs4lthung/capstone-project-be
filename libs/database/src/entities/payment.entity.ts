import { PaymentStatus } from '@app/shared/enums/payment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ name: 'coach_earning_total', type: 'bigint' })
  coachEarningTotal: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'external_transaction_id', type: 'text', nullable: true })
  externalTransactionId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;
}
