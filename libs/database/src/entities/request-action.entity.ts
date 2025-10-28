import { RequestActionType } from '@app/shared/enums/request.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Request } from './request.entity';
import { User } from './user.entity';

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

  @ManyToOne(() => User, (user) => user.requestActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'handled_by' })
  handledBy: User;

  @ManyToOne(() => Request, (request) => request.actions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'request_id' })
  request: Request;
}
