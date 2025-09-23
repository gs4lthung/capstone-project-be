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
import { CoachProfile } from './coach-profile.entity';

@Entity('coach_credentials')
export class CoachCredential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  issuedBy: string;

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  credentialUrl: string;

  @Column({ type: 'text', nullable: true })
  publicUrl: string;

  @ManyToOne(() => CoachProfile, (coachProfile) => coachProfile.credentials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coachProfileId' })
  coachProfile: CoachProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
