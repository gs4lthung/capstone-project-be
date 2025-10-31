import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Session } from './session.entity';
import { IsString } from 'class-validator';
import { User } from './user.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('notes')
export class Note {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'text' })
  @IsString()
  content: string;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.noteTaken, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Field(() => Session)
  @ManyToOne(() => Session, (session) => session.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.noteBeingTaken, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'received_by' })
  receivedBy: User;
}

@ObjectType()
export class PaginatedNote extends PaginatedResource(Note) {}
