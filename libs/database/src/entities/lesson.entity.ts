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
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { Video } from './video.entity';
import { Quiz } from './quiz.entity';

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
  duration: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Session, (session) => session.lesson)
  sessions: Session[];

  @OneToOne(() => Video, (video) => video.lesson, {
    cascade: ['insert'],
    eager: true,
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @OneToOne(() => Quiz, (quiz) => quiz.lesson, {
    cascade: ['insert'],
    eager: true,
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}
