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
import { Course } from './course.entity';
import { Note } from './note.entity';
import { Attendance } from './attendance.entity';
import { SessionLearningContent } from './session-learning-content.entity';
import { QuizAttempt } from './quiz_attempt.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { SessionEarning } from './session-earning.entity';
import { LearnerVideo } from './learner-video.entity';

@Entity('sessions')
@Check(`start_time < end_time`)
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'session_number', type: 'int' })
  sessionNumber: number;

  @Column({ name: 'schedule_date', type: 'date' })
  scheduleDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'duration_in_minutes', type: 'int' })
  durationInMinutes: number;

  @Column({
    name: 'video_conference_channel_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  videoConferenceChannelName?: string;

  @Column({ name: 'video_conference_link', type: 'text', nullable: true })
  videoConferenceLink?: string;

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

  @Column({
    name: 'coach_payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  coachPaymentStatus: PaymentStatus;

  @ManyToOne(() => Course, (course) => course.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Note, (note) => note.session)
  notes: Note[];

  @OneToMany(() => Attendance, (attendance) => attendance.session)
  attendances: Attendance[];

  @OneToMany(() => SessionLearningContent, (slc) => slc.session)
  sessionLearningContents: SessionLearningContent[];

  @OneToMany(() => QuizAttempt, (quizAttempt) => quizAttempt.session)
  quizAttempts: QuizAttempt[];

  @OneToMany(() => WalletTransaction, (transaction) => transaction.session)
  transactions: WalletTransaction[];

  @OneToMany(() => SessionEarning, (sessionEarning) => sessionEarning.session)
  sessionEarnings: SessionEarning[];

  @OneToMany(() => LearnerVideo, (learnerVideo) => learnerVideo.session)
  learnerVideos: LearnerVideo[];
}
