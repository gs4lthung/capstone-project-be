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
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Course } from './course.entity';
import { Payment } from './payment.entity';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('enrollments')
export class Enrollment {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'bigint', nullable: true })
  paymentAmount?: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.UNPAID,
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.enrollments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.enrollments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => [Payment], { nullable: true })
  @OneToMany(() => Payment, (payment) => payment.enrollment, {
    eager: true,
  })
  payments: Payment[];
}

@ObjectType()
export class PaginatedEnrollment extends PaginatedResource(Enrollment) {}
