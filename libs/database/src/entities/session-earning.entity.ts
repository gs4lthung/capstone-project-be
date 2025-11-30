import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Session } from './session.entity';

@Entity('session_earnings')
export class SessionEarning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'session_price',
    type: 'numeric',
    precision: 15,
    scale: 3,
  })
  sessionPrice: number;

  @Column({
    name: 'coach_earning_total',
    type: 'numeric',
    precision: 15,
    scale: 3,
  })
  coachEarningTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'paid_at', type: 'date', nullable: true })
  paidAt?: Date;

  @ManyToOne(() => Session, (session) => session.sessionEarnings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
