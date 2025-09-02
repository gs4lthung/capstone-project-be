import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMemberRole } from '@app/shared/enums/chat.enum';
import { Chat } from './chat.entity';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.chatMembers, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ChatMemberRole,
    default: ChatMemberRole.MEMBER,
  })
  role: ChatMemberRole;

  @CreateDateColumn()
  joinedAt: Date;
}
