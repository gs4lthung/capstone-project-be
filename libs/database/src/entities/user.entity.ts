import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Error } from './error.entity';
import { Role } from './role.entity';
import { AuthProvider } from './auth-provider.entity';
import { Notification } from './notification.entity';
import { Coach } from './coach.entity';
import { Request } from './request.entity';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { VideoConferencePresenceLog } from './video-conference-presence-log.entity';
import { Wallet } from './wallet.entity';
import { Learner } from './learner.entity';
import { Course } from './course.entity';
import { Note } from './note.entity';
import { AchievementProgress } from './achievement-progress.entity';
import { Achievement } from './achievement.entity';
import { Configuration } from './configuration.entity';
import { RequestAction } from './request-action.entity';
import { LearnerVideo } from './learner-video.entity';
import { LearnerProgress } from './learner-progress.entity';
import { QuizAttempt } from './quiz_attempt.entity';
import { Enrollment } from './enrollment.entity';
import { Feedback } from './feedback.entity';
import { Attendance } from './attendance.entity';
import { Quiz } from './quiz.entity';
import { Video } from './video.entity';
import { Subject } from './subject.entity';

@Entity('users')
@Check(
  'CHK_USERS_EMAIL_PHONE_HAVE_AT_LEAST_ONE',
  '"email" IS NOT NULL OR "phone_number" IS NOT NULL',
)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 50 })
  @IsString()
  @Min(2)
  @Max(50)
  fullName: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  @Index({ unique: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 25,
    nullable: true,
    unique: true,
  })
  @Index({ unique: true })
  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Column({ name: 'profile_picture', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  @Index()
  isEmailVerified: boolean;

  @Column({ name: 'is_phone_verified', type: 'boolean', default: false })
  @Index()
  isPhoneVerified: boolean;

  @Column({
    name: 'email_verification_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emailVerificationToken?: string;

  @Column({
    name: 'reset_password_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resetPasswordToken?: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Error, (error) => error.user)
  errors: Error[];

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user, {
    cascade: ['insert'],
  })
  authProviders: AuthProvider[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: true })
  @JoinColumn({ name: 'role_id' })
  @Index()
  role: Role;

  @OneToMany(() => Coach, (coach) => coach.user, { cascade: ['insert'] })
  coach: Coach[];

  @OneToMany(() => Learner, (learner) => learner.user, { cascade: ['insert'] })
  learner: Learner[];

  @OneToMany(() => Request, (request) => request.createdBy)
  requests: Request[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => VideoConferencePresenceLog, (log) => log.user)
  videoConferencePresenceLogs: VideoConferencePresenceLog[];

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    eager: true,
  })
  wallet: Wallet;

  @OneToMany(() => Course, (course) => course.createdBy)
  courses: Course[];

  @OneToMany(() => Note, (note) => note.createdBy)
  noteTaken: Note[];

  @OneToMany(
    () => AchievementProgress,
    (achievementProgress) => achievementProgress.user,
  )
  achievementProgresses: AchievementProgress[];

  @OneToMany(() => Achievement, (achievement) => achievement.createdBy)
  achievements: Achievement[];

  @OneToMany(() => Configuration, (configuration) => configuration.createdBy)
  createdConfigurations: Configuration[];

  @OneToMany(() => Configuration, (configuration) => configuration.updatedBy)
  updatedConfigurations: Configuration[];

  @OneToMany(() => RequestAction, (requestAction) => requestAction.handledBy)
  requestActions: RequestAction[];

  @OneToMany(() => LearnerVideo, (learnerVideo) => learnerVideo.user)
  learnerVideos: LearnerVideo[];

  @OneToMany(() => LearnerProgress, (learnerProgress) => learnerProgress.user)
  learnerProgresses: LearnerProgress[];

  @OneToMany(() => QuizAttempt, (quizAttempt) => quizAttempt.attemptedBy)
  quizAttempts: QuizAttempt[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Feedback, (feedback) => feedback.createdBy)
  createdFeedback: Feedback[];

  @OneToMany(() => Feedback, (feedback) => feedback.receivedBy)
  receivedFeedback: Feedback[];

  @OneToMany(() => Note, (note) => note.receivedBy)
  noteBeingTaken: Note[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendances: Attendance[];

  @OneToMany(() => Quiz, (quiz) => quiz.createdBy)
  quizzes: Quiz[];

  @OneToMany(() => Video, (video) => video.uploadedBy)
  videos: Video[];

  @OneToMany(() => Subject, (subject) => subject.createdBy)
  subjects: Subject[];
}
