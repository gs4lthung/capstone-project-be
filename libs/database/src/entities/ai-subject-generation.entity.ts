import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { AiSubjectGenerationResponse } from '@app/shared/interfaces/ai-subject-generation.interface';

export enum AiSubjectGenerationStatus {
  PENDING = 'PENDING',
  USED = 'USED',
}

@Entity('ai_subject_generations')
export class AiSubjectGeneration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'jsonb' })
  generatedData: AiSubjectGenerationResponse;

  @Column({
    type: 'enum',
    enum: AiSubjectGenerationStatus,
    default: AiSubjectGenerationStatus.PENDING,
  })
  status: AiSubjectGenerationStatus;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @OneToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'created_subject_id' })
  createdSubject?: Subject;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
