import {
  CourseLearningFormat,
  CourseStatus,
} from '@app/shared/enums/course.enum';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { Session } from './session.entity';
import { Enrollment } from './enrollment.entity';
import { Feedback } from './feedback.entity';
import { LearnerProgress } from './learner-progress.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { User } from './user.entity';
import { District } from './district.entity';
import { Province } from './province.entity';
import { Subject } from './subject.entity';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('courses')
@Check(
  `min_participants > 0 AND max_participants > 0 AND max_participants >= min_participants`,
)
@Check(`start_date <= end_date`)
export class Course {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @IsInt()
  @Min(1)
  order: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  level: PickleballLevel;

  @Field(() => String)
  @Column({
    name: 'learning_format',
    type: 'enum',
    enum: CourseLearningFormat,
    default: CourseLearningFormat.GROUP,
  })
  @IsEnum(CourseLearningFormat)
  learningFormat: CourseLearningFormat;

  @Field(() => String)
  @Column({
    name: 'status',
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.PENDING_APPROVAL,
  })
  @IsEnum(CourseStatus)
  status: CourseStatus;

  @Field(() => Number)
  @Column({ name: 'min_participants', type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  minParticipants: number;

  @Field(() => Number)
  @Column({ name: 'max_participants', type: 'int', default: 10 })
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @Field(() => Number)
  @Column({
    name: 'price_per_participant',
    type: 'numeric',
    precision: 15,
    scale: 3,
    default: 0,
  })
  @IsInt()
  @Min(0)
  pricePerParticipant: number;

  @Field(() => Number)
  @Column({ name: 'current_participants', type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  currentParticipants: number;

  @Column({ name: 'total_sessions', type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  totalSessions: number;

  @Column({
    name: 'total_earnings',
    type: 'numeric',
    precision: 15,
    scale: 3,
    default: 0,
  })
  @IsInt()
  @Min(0)
  totalEarnings: number;

  @Field(() => GqlCustomDateTime)
  @Column({ name: 'start_date', type: 'date' })
  @IsDate()
  startDate: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @Column({ name: 'end_date', type: 'date', nullable: true })
  @IsDate()
  endDate?: Date;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.courses, {
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    eager: true,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToMany(() => Session, (session) => session.course, {
    cascade: ['insert'],
  })
  sessions: Session[];

  @OneToMany(() => Schedule, (schedule) => schedule.course, {
    eager: true,
    cascade: ['insert'],
  })
  schedules: Schedule[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, {
    cascade: ['update'],
  })
  enrollments: Enrollment[];

  @OneToMany(() => Feedback, (feedback) => feedback.course)
  feedbacks: Feedback[];

  @OneToMany(() => LearnerProgress, (learnerProgress) => learnerProgress.course)
  learnerProgresses: LearnerProgress[];

  @Field(() => String)
  @Column({ name: 'address', type: 'text' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field(() => Province)
  @ManyToOne(() => Province, (province) => province.courses, {
    eager: true,
  })
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Field(() => District)
  @ManyToOne(() => District, (district) => district.courses, {
    eager: true,
  })
  @JoinColumn({ name: 'district_id' })
  district: District;
}

@ObjectType()
export class PaginatedCourse extends PaginatedResource(Course) {}
