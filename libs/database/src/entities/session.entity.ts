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

import { Course } from './course.entity';
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
import { Quiz } from './quiz.entity';
import { Video } from './video.entity';

@Entity('sessions')
@Check(`start_time < end_time`)
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @Column({ name: 'session_number', type: 'int' })
  @IsNotEmpty()
  @IsInt()
  sessionNumber: number;

  @Column({ name: 'schedule_date', type: 'date' })
  @IsDate()
  scheduleDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'duration_in_minutes', type: 'int', nullable: true })
  durationInMinutes?: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ name: 'completed_at', type: 'date', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Course, (course) => course.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Attendance, (attendance) => attendance.session)
  attendances: Attendance[];

  @OneToMany(() => QuizAttempt, (quizAttempt) => quizAttempt.session)
  quizAttempts: QuizAttempt[];

  @OneToMany(() => WalletTransaction, (transaction) => transaction.session)
  transactions: WalletTransaction[];

  @OneToMany(() => SessionEarning, (sessionEarning) => sessionEarning.session, {
    cascade: ['insert', 'update'],
  })
  sessionEarnings: SessionEarning[];

  @OneToMany(() => LearnerVideo, (learnerVideo) => learnerVideo.session)
  learnerVideos: LearnerVideo[];

  @ManyToOne(() => Lesson, (lesson) => lesson.sessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => Quiz, (quiz) => quiz.session, {
    cascade: ['insert', 'update'],
  })
  quizzes: Quiz[];

  @OneToMany(() => Video, (video) => video.session, {
    cascade: ['insert', 'update'],
  })
  videos: Video[];
}
