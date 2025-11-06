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
import { NotificationType } from '@app/shared/enums/notification.enum';

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

  @Column({ type: 'varchar', length: 20, nullable: true })
  navigateTo?: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

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
