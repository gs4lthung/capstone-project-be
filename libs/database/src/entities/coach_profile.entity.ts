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
import { CoachCredential } from './coach_credential.entity';

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

  @Column({ type: 'int' })
  basePrice: number;

  @Column({
    type: 'enum',
    enum: CoachVerificationStatus,
    default: CoachVerificationStatus.PENDING,
  })
  verificationStatus: CoachVerificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CoachCredential, (credential) => credential.coachProfile, {
    cascade: ['insert', 'update', 'remove'],
    eager: true,
  })
  credentials: CoachCredential[];
}
