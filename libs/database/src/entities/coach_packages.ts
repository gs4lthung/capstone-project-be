import { CoachPackageStatus } from '@app/shared/enums/coach.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CoachProfile } from './coach_profile.entity';

@Entity('coach_packages')
export class CoachPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  totalSessions: number;

  @Column({ type: 'int' })
  sessionDurationMin: number;

  @Column({ type: 'int' })
  price: number;

  @Column({
    type: 'enum',
    enum: CoachPackageStatus,
    default: CoachPackageStatus.DRAFT,
  })
  status: CoachPackageStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => CoachProfile, (coachProfile) => coachProfile.packages)
  @JoinColumn({ name: 'coachProfileId' })
  coachProfile: CoachProfile;
}
