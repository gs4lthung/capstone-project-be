import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Chat } from './chat.entity';
import { MessageRead } from './message-read.entity';
import { ChatMessageType } from '@app/shared/enums/chat.enum';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'SET NULL' })
  sender: User;

  @Column({ type: 'enum', enum: ChatMessageType })
  type: ChatMessageType;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ nullable: true })
  mediaPublicId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MessageRead, (read) => read.message)
  reads: MessageRead[];
}
