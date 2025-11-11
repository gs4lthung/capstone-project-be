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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { Session } from './session.entity';
import { Enrollment } from './enrollment.entity';
import { Feedback } from './feedback.entity';
import { LearnerProgress } from './learner-progress.entity';
import { User } from './user.entity';
import { District } from './district.entity';
import { Province } from './province.entity';
import { Subject } from './subject.entity';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { VideoConference } from './video-conference.entity';
import { Index } from 'typeorm';

@Entity('courses')
@Check(
  `min_participants > 0 AND max_participants > 0 AND max_participants >= min_participants`,
)
@Check(`start_date <= end_date`)
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @IsInt()
  @Min(1)
  order: number;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Column({
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  level: PickleballLevel;

  @Column({
    name: 'learning_format',
    type: 'enum',
    enum: CourseLearningFormat,
    default: CourseLearningFormat.GROUP,
  })
  @IsEnum(CourseLearningFormat)
  learningFormat: CourseLearningFormat;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.PENDING_APPROVAL,
  })
  @IsEnum(CourseStatus)
  status: CourseStatus;

  @Column({ name: 'min_participants', type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  minParticipants: number;

  @Column({ name: 'max_participants', type: 'int', default: 10 })
  @IsInt()
  @Min(1)
  maxParticipants: number;

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

  @Column({ name: 'start_date', type: 'date' })
  @IsDate()
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  @IsDate()
  endDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ name: 'cancelling_reason', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  cancellingReason?: string;

  @Index()
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
    cascade: ['insert', 'update'],
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

  @Column({ name: 'address', type: 'text' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @Index()
  @ManyToOne(() => Province, (province) => province.courses, {
    eager: true,
  })
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Index()
  @ManyToOne(() => District, (district) => district.courses, {
    eager: true,
  })
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToOne(() => VideoConference, (vc) => vc.course)
  @JoinColumn({ name: 'video_conference_id' })
  videoConference: VideoConference;
}
