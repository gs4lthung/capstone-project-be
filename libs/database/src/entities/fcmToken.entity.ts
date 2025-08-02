import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/scalars/gql-custom-datetime.scalar';

@Entity('fcm_tokens')
@ObjectType()
export class FcmToken {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Field(() => String)
  token: string;

  @Column({ type: 'varchar', length: 50 })
  @Field(() => String)
  deviceType: 'android' | 'ios' | 'web';

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Field(() => String, { nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Field(() => String, { nullable: true })
  platform?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @Field(() => GqlCustomDateTime)
  lastSeenAt: Date;

  @ManyToOne(() => User, (user) => user.fcmTokens)
  @JoinColumn({ name: 'userId' })
  user: User;
}
