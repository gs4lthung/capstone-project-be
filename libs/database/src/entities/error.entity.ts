import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('errors')
export class Error {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 5000, nullable: true })
  stack: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  body: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'resolved_at' })
  resolvedAt: Date;

  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @ManyToOne(() => User, (user) => user.errors, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
