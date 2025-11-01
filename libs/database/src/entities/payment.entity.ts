import { PaymentStatus } from '@app/shared/enums/payment.enum';
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
import { Enrollment } from './enrollment.entity';
import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('payments')
export class Payment {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number)
  @Column({ type: 'numeric', precision: 15, scale: 3 })
  @Min(0)
  amount: number;

  @Field(() => String)
  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Number)
  @Column({ type: 'int' })
  @IsInt()
  orderCode: number;

  @Field(() => String)
  @Column({ type: 'text' })
  paymentLinkId: string;

  @Field(() => String)
  @Column({ type: 'text' })
  @IsUrl()
  checkoutUrl: string;

  @Field(() => String)
  @Column({ type: 'text' })
  qrCode: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Enrollment)
  @ManyToOne(() => Enrollment, (enrollment) => enrollment.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;
}

@ObjectType()
export class PaginatedPayment extends PaginatedResource(Payment) {}
