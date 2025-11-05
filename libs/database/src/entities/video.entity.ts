import { CoachVideoStatus } from '@app/shared/enums/coach.enum';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import { Session } from './session.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('videos')
@Check(
  `("lesson_id" IS NOT NULL AND "session_id" IS NULL) OR ("lesson_id" IS NULL AND "session_id" IS NOT NULL)`,
)
export class Video {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'text', nullable: true })
  tags?: string[];

  @Field(() => Number)
  @Column({ type: 'int' })
  duration: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'drill_name', type: 'varchar', length: 50, nullable: true })
  drillName: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'drill_description', type: 'text', nullable: true })
  drillDescription?: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'drill_practice_sets', type: 'text', nullable: true })
  drillPracticeSets?: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'public_url', type: 'text', nullable: true })
  publicUrl?: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: CoachVideoStatus,
    default: CoachVideoStatus.UPLOADING,
  })
  status: CoachVideoStatus;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.videos, {
    eager: true,
  })
  uploadedBy: User;

  @Field(() => Lesson, { nullable: true })
  @ManyToOne(() => Lesson, (lesson) => lesson.videos, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Session, (session) => session.videos, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Field(() => [AiVideoComparisonResult], { nullable: true })
  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.video,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];
}

@ObjectType()
export class PaginatedVideo extends PaginatedResource(Video) {}
