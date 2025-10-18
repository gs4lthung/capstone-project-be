import { RequestActionType } from '@app/shared/enums/request.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Request } from './request.entity';

@Entity('request_actions')
export class RequestAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RequestActionType })
  type: RequestActionType;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Admin, (admin) => admin.requestActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'handled_by' })
  handledBy: Admin;

  @ManyToOne(() => Request, (request) => request.actions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: Request;
}
