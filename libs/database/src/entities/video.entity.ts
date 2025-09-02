import { PickleBallLevelEnum } from '@app/shared/enums/pickleball.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'array', default: [] })
  tags: string[];

  @Column({
    type: 'enum',
    enum: PickleBallLevelEnum,
    default: PickleBallLevelEnum.BEGINNER_1_0,
  })
  level?: PickleBallLevelEnum;

  @Column({ type: 'varchar', length: 255 })
  publicUrl: string;

  @Column({ type: 'varchar', length: 255 })
  thumbnailUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
