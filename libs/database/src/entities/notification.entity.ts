import { NotificationStatusEnum } from '@app/shared/enums/notification.enum';
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
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Field(() => String)
  @Column({ type: 'text' })
  body: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationStatusEnum,
    default: NotificationStatusEnum.PENDING,
  })
  status: NotificationStatusEnum;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@ObjectType()
export class PaginatedNotification extends PaginatedResource(Notification) {}
