import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { ScheduleDayOfWeek } from '@app/shared/enums/schedule.enum';
import { IsEnum, IsInt, Min } from 'class-validator';
import { Session } from './session.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'day_of_week',
    type: 'enum',
    enum: ScheduleDayOfWeek,
  })
  @IsEnum(ScheduleDayOfWeek)
  dayOfWeek: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'total_sessions', type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  totalSessions: number;

  @ManyToOne(() => Course, (course) => course.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Session, (session) => session.schedule)
  sessions: Session[];
}
