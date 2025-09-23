import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { CoachCredential } from './coach-credential.entity';
import { CoachPackage } from './coach-packages.entity';

@Entity('coach_profiles')
export class CoachProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.coachProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'varchar', length: 100 })
  specialties: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  teachingMethod?: string;

  @Column({ type: 'varchar', length: 100 })
  location: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @Column({ type: 'int' })
  basePrice: number;

  @Column({
    type: 'enum',
    enum: CoachVerificationStatus,
    default: CoachVerificationStatus.PENDING,
  })
  verificationStatus: CoachVerificationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adminNote?: string;

  @Column({ type: 'boolean', default: false })
  isBookingBlocked: boolean;

  @Column({ type: 'text', nullable: true })
  bookingBlockedReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CoachCredential, (credential) => credential.coachProfile, {
    cascade: ['insert', 'update', 'remove'],
    eager: true,
  })
  credentials: CoachCredential[];

  @OneToMany(() => CoachPackage, (pack) => pack.coachProfile, {
    eager: true,
  })
  packages: CoachPackage[];
}
