import { CourseLearningFormat } from '@app/shared/enums/course.enum';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
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
import { Coach } from './coach.entity';
import { Schedule } from './schedule.entity';
import { Session } from './session.entity';
import { Enrollment } from './enrollment.entity';
import { Feedback } from './feedback.entity';
import { LearnerProgress } from './learner-progress.entity';

@Entity('courses')
@Check(
  `min_participants > 0 AND max_participants > 0 AND max_participants >= min_participants`,
)
@Check(`start_date < end_date`)
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
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
    default: CourseLearningFormat.INDIVIDUAL,
  })
  @IsEnum(CourseLearningFormat)
  learningFormat: CourseLearningFormat;

  @Column({ name: 'min_participants', type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  minParticipants: number;

  @Column({ name: 'max_participants', type: 'int', default: 10 })
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @Column({ name: 'price_per_participant', type: 'bigint', default: 0 })
  @IsInt()
  @Min(0)
  pricePerParticipant: number;

  @Column({ name: 'start_date', type: 'date' })
  @IsDate()
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  @IsDate()
  endDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => Coach, (coach) => coach.courses, {
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: Coach;

  @OneToMany(() => Session, (session) => session.course, {
    cascade: ['insert'],
  })
  sessions: Session[];

  @OneToMany(() => Schedule, (schedule) => schedule.course, {
    eager: true,
    cascade: ['insert'],
  })
  schedules: Schedule[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Feedback, (feedback) => feedback.course)
  feedbacks: Feedback[];

  @OneToMany(() => LearnerProgress, (learnerProgress) => learnerProgress.course)
  learnerProgresses: LearnerProgress[];
}
