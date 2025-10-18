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
import { Learner } from './learner.entity';
import { Payment } from './payment.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING_GROUP,
  })
  status: EnrollmentStatus;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Learner, (learner) => learner.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'learner_id' })
  learner: Learner;

  @OneToMany(() => Payment, (payment) => payment.enrollment)
  payments: Payment[];
}
