import { PaymentStatus } from '@app/shared/enums/payment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Enrollment } from './enrollment.entity';
import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 15, scale: 3 })
  @Min(0)
  amount: number;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column({ type: 'int' })
  @IsInt()
  orderCode: number;

  @Column({ type: 'text' })
  paymentLinkId: string;

  @Column({ type: 'text' })
  @IsUrl()
  checkoutUrl: string;

  @Column({ type: 'text' })
  qrCode: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'expired_at', type: 'date', nullable: true })
  expiredAt?: Date;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;
}
