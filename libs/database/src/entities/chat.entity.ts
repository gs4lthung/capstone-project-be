import { ChatTypeEnum } from '@app/shared/enums/chat.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMember } from './chat-members.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ChatTypeEnum })
  type: ChatTypeEnum;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ChatMember, (member) => member.chat, {
    cascade: ['insert'],
  })
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat, {
    nullable: true,
  })
  messages?: Message[];
}
