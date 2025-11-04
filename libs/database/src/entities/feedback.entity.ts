import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Course } from './course.entity';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('feedbacks')
export class Feedback {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @Column({ type: 'int' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.createdFeedback, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.receivedFeedback, { eager: true })
  @JoinColumn({ name: 'received_by' })
  receivedBy: User;

  @ManyToOne(() => Course, (course) => course.feedbacks)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}

@ObjectType()
export class PaginatedFeedback extends PaginatedResource(Feedback) {}
