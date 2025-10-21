import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from './session.entity';
import { User } from './user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Session, (session) => session.reports)
  session: Session;

  @ManyToOne(() => User, (user) => user.reports)
  createdBy: User;
}
