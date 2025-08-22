import { PaymentStatusEnum } from '@app/shared/enums/payment.enum';
import { GqlCustomDateTime } from '@app/shared/scalars/gql-custom-datetime.scalar';
import { Field, ObjectType } from '@nestjs/graphql';
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
@ObjectType()
export class Order {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ type: 'int' })
  @Field(() => Number)
  orderCode: number;

  @Column({ type: 'int' })
  @Field(() => Number)
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  @Field(() => String)
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Field(() => String, { nullable: true })
  buyerName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  buyerEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Field(() => String, { nullable: true })
  buyerAddress?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  @Field(() => String)
  status: PaymentStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => GqlCustomDateTime, { nullable: true })
  expiredAt?: Date;

  @CreateDateColumn()
  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => GqlCustomDateTime)
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;
}
