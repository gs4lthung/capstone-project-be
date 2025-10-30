import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Payment } from './payment.entity';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true })
  paymentAmount?: number;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING_GROUP,
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, (user) => user.enrollments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.enrollment, {
    eager: true,
  })
  payments: Payment[];
}
