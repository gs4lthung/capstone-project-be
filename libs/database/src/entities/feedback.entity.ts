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
import { Course } from './course.entity';
import { User } from './user.entity';

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

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.feedbacks, { eager: true })
  @JoinColumn({ name: 'user_id' })
  createdBy: User;

  @ManyToOne(() => Course, (course) => course.feedbacks)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
