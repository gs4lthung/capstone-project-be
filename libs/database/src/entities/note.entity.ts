import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Coach } from './coach.entity';
import { Session } from './session.entity';
import { Learner } from './learner.entity';
import { IsString } from 'class-validator';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsString()
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Coach, (coach) => coach.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: Coach;

  @ManyToOne(() => Session, (session) => session.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @ManyToOne(() => Learner, (learner) => learner.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;
}
