import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Course } from './course.entity';
import { ScheduleDayOfWeek } from '@app/shared/enums/schedule.enum';
import { IsEnum } from 'class-validator';

@ObjectType()
@Entity('schedules')
export class Schedule {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({
    name: 'day_of_week',
    type: 'enum',
    enum: ScheduleDayOfWeek,
  })
  @IsEnum(ScheduleDayOfWeek)
  dayOfWeek: string;

  @Field(() => String)
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Field(() => String)
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedSchedule extends PaginatedResource(Schedule) {}
