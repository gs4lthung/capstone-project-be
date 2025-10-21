import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { Video } from './video.entity';

@Entity('session_videos')
export class SessionVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Session, (session) => session.sessionVideos, {
    onDelete: 'CASCADE',
  })
  session: Session;

  @ManyToOne(() => Video, (video) => video.sessionVideos, {
    onDelete: 'CASCADE',
  })
  video: Video;
}
