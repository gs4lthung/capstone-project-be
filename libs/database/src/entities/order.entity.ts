import { PaymentStatusEnum } from '@app/shared/enums/payment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderCode: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buyerEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerAddress?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
}
