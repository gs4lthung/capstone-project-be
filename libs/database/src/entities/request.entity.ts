import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestStatus, RequestType } from '@app/shared/enums/request.enum';
import { RequestAction } from './request-action.entity';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { JSONScalar } from '@app/shared/graphql/scalars/json.scalar';

interface RequestMetadata {
  type: 'course' | 'quiz' | 'coach' | 'video';
  id: number;
  details: any;
}

@ObjectType()
@Entity('requests')
export class Request {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'text' })
  @IsString()
  description: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: RequestType,
  })
  @IsEnum(RequestType)
  type: RequestType;

  @Field(() => String)
  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @Field(() => JSONScalar, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata: RequestMetadata;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.requests, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => RequestAction, (action) => action.request, {
    nullable: true,
  })
  actions: RequestAction[];
}
