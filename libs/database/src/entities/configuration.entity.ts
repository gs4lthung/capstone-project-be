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

@Entity('configurations')
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'data_type',
    type: 'enum',
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string',
  })
  dataType: 'string' | 'number' | 'boolean' | 'json';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdConfigurations)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedConfigurations)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;
}
