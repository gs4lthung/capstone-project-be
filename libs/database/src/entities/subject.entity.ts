import {
  IsEnum,
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
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { Lesson } from './lesson.entity';

@Entity('subjects')
export class Subject {
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

  @Column({
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  level: PickleballLevel;

  @Column({
    type: 'enum',
    enum: SubjectStatus,
    default: SubjectStatus.DRAFT,
  })
  @IsEnum(SubjectStatus)
  status: SubjectStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.subjects, {
    onDelete: 'SET NULL',
    eager: true,
  })
  createdBy: User;

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];

  @OneToMany(() => Lesson, (lesson) => lesson.subject)
  lessons: Lesson[];
}
