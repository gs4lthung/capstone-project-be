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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Session } from './session.entity';
import { Video } from './video.entity';
import { Quiz } from './quiz.entity';
import { Subject } from './subject.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('lessons')
export class Lesson {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

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

  @Field(() => Number)
  @Column({ name: 'lesson_number', type: 'int' })
  @IsNotEmpty()
  @IsInt()
  lessonNumber: number;

  @Field(() => Number, { nullable: true })
  @Column({ name: 'duration', type: 'int' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Field(() => [Session], { nullable: true })
  @OneToMany(() => Session, (session) => session.lesson)
  sessions: Session[];

  @Field(() => Video, { nullable: true })
  @OneToOne(() => Video, (video) => video.lesson, {
    cascade: ['insert'],
    eager: true,
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Field(() => Quiz, { nullable: true })
  @OneToOne(() => Quiz, (quiz) => quiz.lesson, {
    cascade: ['insert'],
    eager: true,
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Field(() => Subject)
  @ManyToOne(() => Subject, (subject) => subject.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;
}

@ObjectType()
export class PaginatedLesson extends PaginatedResource(Lesson) {}
