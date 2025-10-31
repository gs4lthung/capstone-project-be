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
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('subjects')
export class Subject {
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

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  level: PickleballLevel;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: SubjectStatus,
    default: SubjectStatus.DRAFT,
  })
  @IsEnum(SubjectStatus)
  status: SubjectStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.subjects, {
    onDelete: 'SET NULL',
    eager: true,
  })
  createdBy: User;

  @Field(() => [Course], { nullable: true })
  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];

  @OneToMany(() => Lesson, (lesson) => lesson.subject, { eager: true })
  lessons: Lesson[];
}

@ObjectType()
export class PaginatedSubject extends PaginatedResource(Subject) {}
