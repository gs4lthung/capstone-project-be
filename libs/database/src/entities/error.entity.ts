import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  resolvedAt: Date;

  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @ManyToOne(() => User, (user) => user.errors, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
