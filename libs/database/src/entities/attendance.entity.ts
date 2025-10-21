import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Learner } from './learner.entity';
import { Session } from './session.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Learner, (learner) => learner.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;

  @ManyToOne(() => Session, (session) => session.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
