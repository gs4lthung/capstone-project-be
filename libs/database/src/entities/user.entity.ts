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
import { FcmToken } from './fcm-token.entity';
import { AuthProvider } from './auth-provider.entity';
import { Notification } from './notification.entity';
import { Order } from './order.entity';
import { Video } from './video.entity';
import { CoachProfile } from './coach-profile.entity';
import { LearnerProfile } from './learner-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  profilePicture?: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Error, (error) => error.user)
  errors: Error[];

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user, {
    cascade: true,
  })
  authProviders: AuthProvider[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => FcmToken, (fcmToken) => fcmToken.user, {
    cascade: true,
    eager: true,
  })
  fcmTokens: FcmToken[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToOne(() => CoachProfile, (coachProfile) => coachProfile.user, {
    cascade: true,
    eager: true,
  })
  coachProfile: CoachProfile;

  @OneToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.user, {
    cascade: true,
    eager: true,
  })
  learnerProfile: LearnerProfile;
}
