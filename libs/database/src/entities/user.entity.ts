import {
  Column,
  DeleteDateColumn,
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
import { AuthProvider } from './auth-provider.entity';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Column({ type: 'varchar', length: 50 })
  @Field(() => String)
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Field(() => String)
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @Field(() => String, { nullable: true })
  profilePicture?: string;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

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

  @DeleteDateColumn()
  @Field(() => GqlCustomDateTime, { nullable: true })
  deletedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Error, (error) => error.user)
  errors: Error[];

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user, {
    cascade: true,
  })
  authProviders: AuthProvider[];

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
