import { PaymentStatus } from '@app/shared/enums/payment.enum';
import { SessionStatus } from '@app/shared/enums/session.enum';
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
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Course } from './course.entity';
import { Note } from './note.entity';
import { Attendance } from './attendance.entity';
import { QuizAttempt } from './quiz_attempt.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { SessionEarning } from './session-earning.entity';
import { LearnerVideo } from './learner-video.entity';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Lesson } from './lesson.entity';

@ObjectType()
@Entity('sessions')
@Check(`start_time < end_time`)
export class Session {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Field(() => Number)
  @Column({ name: 'session_number', type: 'int' })
  @IsNotEmpty()
  @IsInt()
  sessionNumber: number;

  @Field(() => GqlCustomDateTime)
  @Column({ name: 'schedule_date', type: 'date' })
  @IsDate()
  scheduleDate: Date;

  @Field(() => String)
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Field(() => String)
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Field(()=> Number)
  @Column({ name: 'duration_in_minutes', type: 'int', nullable: true })
  durationInMinutes?: number;

  @Field(() => String, { nullable: true })
  @Column({
    name: 'video_conference_channel_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  videoConferenceChannelName?: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'video_conference_link', type: 'text', nullable: true })
  videoConferenceLink?: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt?: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @Column({ name: 'completed_at', type: 'date', nullable: true })
  completedAt?: Date;

  @Field(() => String)
  @Column({
    name: 'coach_payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  coachPaymentStatus: PaymentStatus;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Field(() => [Note], { nullable: true })
  @OneToMany(() => Note, (note) => note.session)
  notes: Note[];

  @Field(() => [Attendance], { nullable: true })
  @OneToMany(() => Attendance, (attendance) => attendance.session)
  attendances: Attendance[];

  @Field(() => [QuizAttempt], { nullable: true })
  @OneToMany(() => QuizAttempt, (quizAttempt) => quizAttempt.session)
  quizAttempts: QuizAttempt[];

  @Field(() => [WalletTransaction], { nullable: true })
  @OneToMany(() => WalletTransaction, (transaction) => transaction.session)
  transactions: WalletTransaction[];

  @Field(() => [SessionEarning], { nullable: true })
  @OneToMany(() => SessionEarning, (sessionEarning) => sessionEarning.session)
  sessionEarnings: SessionEarning[];

  @Field(() => [LearnerVideo], { nullable: true })
  @OneToMany(() => LearnerVideo, (learnerVideo) => learnerVideo.session)
  learnerVideos: LearnerVideo[];

  @Field(() => Lesson, { nullable: true })
  @ManyToOne(() => Lesson, (lesson) => lesson.sessions)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedSession extends PaginatedResource(Session) {}
