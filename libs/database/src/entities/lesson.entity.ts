import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
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
import { Session } from './session.entity';
import { Video } from './video.entity';
import { Quiz } from './quiz.entity';
import { Subject } from './subject.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ name: 'lesson_number', type: 'int' })
  @IsNotEmpty()
  @IsInt()
  lessonNumber: number;

  @Column({ name: 'duration', type: 'int' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Session, (session) => session.lesson)
  sessions: Session[];

  @OneToMany(() => Video, (video) => video.lesson, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  videos: Video[];

  @OneToMany(() => Quiz, (quiz) => quiz.lesson, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  quizzes: Quiz[];

  @ManyToOne(() => Subject, (subject) => subject.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;
}
