import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { Credential } from './credential.entity';
import { IsString } from 'class-validator';

@Entity('coaches')
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsString()
  bio: string;

  @Column({ type: 'text', nullable: true })
  specialties: string[];

  @Column({ name: 'teaching_methods', type: 'text', nullable: true })
  teachingMethods: string[];

  @Column({ name: 'year_of_experience', type: 'int' })
  yearOfExperience: number;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: CoachVerificationStatus,
    default: CoachVerificationStatus.UNVERIFIED,
  })
  verificationStatus: CoachVerificationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.coach, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @OneToMany(() => Credential, (credential) => credential.coach, {
    cascade: ['insert'],
  })
  credentials: Credential[];
}
