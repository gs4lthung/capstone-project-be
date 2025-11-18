import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';

@Entity('learners')
export class Learner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'skill_level',
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  skillLevel: PickleballLevel;

  @Column({
    name: 'learning_goal',
    type: 'enum',
    enum: PickleballLevel,
    default: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  learningGoal: PickleballLevel;

  @ManyToOne(() => User, (user) => user.learner, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
