import { LearnerVideoStatus } from '@app/shared/enums/learner.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Session } from './session.entity';
import { AiVideoComparisonResult } from './ai-video-comparison-result.entity';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('learner_videos')
export class LearnerVideo {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => Number)
  @Column({ type: 'int' })
  @IsInt()
  duration: number;

  @Field(() => String)
  @Column({ name: 'public_url', type: 'text' })
  @IsUrl()
  publicUrl: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: LearnerVideoStatus,
    default: LearnerVideoStatus.UPLOADING,
  })
  @IsEnum(LearnerVideoStatus)
  status: LearnerVideoStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.learnerVideos)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Session)
  @ManyToOne(() => Session, (session) => session.learnerVideos)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Field(() => [AiVideoComparisonResult], { nullable: true })
  @OneToMany(
    () => AiVideoComparisonResult,
    (aiVideoComparisonResult) => aiVideoComparisonResult.learnerVideo,
  )
  aiVideoComparisonResults: AiVideoComparisonResult[];
}

@ObjectType()
export class PaginatedLearnerVideo extends PaginatedResource(LearnerVideo) {}
