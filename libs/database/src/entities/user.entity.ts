import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Error } from './error.entity';
import { Role } from './role.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { FcmToken } from './fcmToken.entity';
import { GqlCustomDateTime } from '@app/shared/scalars/gql-custom-datetime.scalar';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ type: 'varchar', length: 50 })
  @Field(() => String)
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Field(() => String)
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field(() => GqlCustomDateTime)
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @Field(() => GqlCustomDateTime)
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Error, (error) => error.user)
  errors: Error[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: true })
  @JoinColumn({ name: 'roleId' })
  @Field(() => Role, { nullable: true })
  role: Role;

  @OneToMany(() => FcmToken, (fcmToken) => fcmToken.user, {
    cascade: true,
    eager: true,
  })
  @Field(() => [FcmToken], { nullable: true })
  fcmTokens: FcmToken[];
}
