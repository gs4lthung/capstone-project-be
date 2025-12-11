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
import { BaseCredential } from './base-credential.entity';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'issued_at', type: 'date', nullable: true })
  issuedAt?: Date;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'public_url', type: 'text', nullable: true })
  publicUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => Coach, (coach) => coach.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @ManyToOne(
    () => BaseCredential,
    (baseCredential) => baseCredential.credentials,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'base_credential_id' })
  baseCredential: BaseCredential;
}
