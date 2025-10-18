import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

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

  @ManyToOne(() => Admin, (admin) => admin.createdConfigurations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  created_by: Admin;

  @ManyToOne(() => Admin, (admin) => admin.updatedConfigurations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'updated_by' })
  updated_by: Admin;
}
