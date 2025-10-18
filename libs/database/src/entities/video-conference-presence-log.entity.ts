import { VideoConferenceEventType } from '@app/shared/enums/video-conference.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('video_conference_presence_logs')
export class VideoConferencePresenceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'channel_name', type: 'varchar', length: 100 })
  channelName: string;

  @Column({ name: 'event_type', type: 'enum', enum: VideoConferenceEventType })
  eventType: VideoConferenceEventType;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.videoConferencePresenceLogs, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
