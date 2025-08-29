import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('message_reads')
export class MessageRead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (message) => message.reads, { onDelete: 'CASCADE' })
  message: Message;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  readAt: Date;
}
