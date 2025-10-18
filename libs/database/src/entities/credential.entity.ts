import { CourseCredentialType } from '@app/shared/enums/course.enum';
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
import { Coach } from './coach.entity';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: CourseCredentialType })
  type: CourseCredentialType;

  @Column({ name: 'public_url', type: 'text', nullable: true })
  publicUrl?: string;

  @Column({ name: 'issued_at', type: 'date', nullable: true })
  issuedAt?: Date;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => Coach, (coach) => coach.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
