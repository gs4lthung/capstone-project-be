import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity('video_conferences')
export class VideoConference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'channel_name', type: 'varchar', length: 100 })
  channelName: string;

  @OneToOne(() => Course, (course) => course.videoConference)
  course: Course;
}
