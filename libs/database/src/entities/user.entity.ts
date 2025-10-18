import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Error } from './error.entity';
import { Role } from './role.entity';
import { AuthProvider } from './auth-provider.entity';
import { Notification } from './notification.entity';
import { Coach } from './coach.entity';
import { Admin } from './admin.entity';
import { LearningContent } from './learning-content.entity';
import { Request } from './request.entity';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { VideoConferencePresenceLog } from './video-conference-presence-log.entity';
import { Wallet } from './wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 50 })
  @IsString()
  @Min(2)
  @Max(50)
  fullName: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  @Index({ unique: true })
  @IsEmail()
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 25, nullable: true })
  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Column({ name: 'profile_picture', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  @Index()
  isEmailVerified: boolean;

  @Column({
    name: 'email_verification_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emailVerificationToken?: string;

  @Column({
    name: 'reset_password_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resetPasswordToken?: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Error, (error) => error.user)
  errors: Error[];

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user, {
    cascade: true,
  })
  authProviders: AuthProvider[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: true })
  @JoinColumn({ name: 'role_id' })
  @Index()
  role: Role;

  @OneToMany(() => Coach, (coach) => coach.user, { cascade: true })
  coach: Coach[];

  @OneToMany(() => Admin, (admin) => admin.id, { cascade: true })
  admin: Admin[];

  @OneToMany(
    () => LearningContent,
    (learningContent) => learningContent.createdBy,
  )
  learningContents: LearningContent[];

  @OneToMany(() => Request, (request) => request.createdBy)
  requests: Request[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => VideoConferencePresenceLog, (log) => log.user)
  videoConferencePresenceLogs: VideoConferencePresenceLog[];

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;
}
