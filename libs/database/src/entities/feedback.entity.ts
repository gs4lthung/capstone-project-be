import { IsInt, IsString, Max, Min } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Learner } from './learner.entity';
import { Course } from './course.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsString()
  comment: string;

  @Column({ type: 'int' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => Learner, (learner) => learner.feedbacks, { eager: true })
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;

  @ManyToOne(() => Course, (course) => course.feedbacks)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
