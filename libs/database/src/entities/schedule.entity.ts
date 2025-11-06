import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { ScheduleDayOfWeek } from '@app/shared/enums/schedule.enum';
import { IsEnum } from 'class-validator';

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

  @ManyToOne(() => Course, (course) => course.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
