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
import { Session } from './session.entity';
import { User } from './user.entity';
import { AttendanceStatus } from '@app/shared/enums/attendance.enum';
import { IsEnum } from 'class-validator';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('attendances')
export class Attendance {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Session, (session) => session.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;
}

@ObjectType()
export class PaginatedAttendance extends PaginatedResource(Attendance) {}
