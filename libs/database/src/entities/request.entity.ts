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
import { RequestAction } from './request-action.entity';
import { User } from './user.entity';
import { IsEnum, IsString } from 'class-validator';

export interface RequestMetadata {
  type: 'course' | 'quiz' | 'coach' | 'video';
  id: number;
  details: any;
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsString()
  description: string;

  @Column({
    type: 'enum',
    enum: RequestType,
  })
  @IsEnum(RequestType)
  type: RequestType;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: RequestMetadata;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.requests, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => RequestAction, (action) => action.request, {
    nullable: true,
  })
  actions: RequestAction[];
}
