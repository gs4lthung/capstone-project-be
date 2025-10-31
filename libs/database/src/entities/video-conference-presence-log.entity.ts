import { VideoConferenceEventType } from '@app/shared/enums/video-conference.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { User } from './user.entity';

@ObjectType()
@Entity('video_conference_presence_logs')
export class VideoConferencePresenceLog {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ name: 'channel_name', type: 'varchar', length: 100 })
  channelName: string;

  @Field(() => String)
  @Column({ name: 'event_type', type: 'enum', enum: VideoConferenceEventType })
  eventType: VideoConferenceEventType;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.videoConferencePresenceLogs, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
export class PaginatedVideoConferencePresenceLog extends PaginatedResource(VideoConferencePresenceLog) {}
