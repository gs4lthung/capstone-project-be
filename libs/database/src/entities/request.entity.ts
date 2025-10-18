import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestStatus, RequestType } from '@app/shared/enums/request.enum';
import { LearningContent } from './learning-content.entity';
import { RequestAction } from './request-action.entity';
import { User } from './user.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: RequestType,
    default: RequestType.COURSE_APPROVAL,
  })
  type: RequestType;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: RequestMetadata;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => RequestAction, (action) => action.id, {
    eager: true,
    nullable: true,
  })
  actions: RequestAction[];
}

export type RequestMetadata = LearningContent;
