import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { Credential } from './credential.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { UserDto } from '@app/shared/dtos/users/user.dto';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('coaches')
export class Coach {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'text' })
  @IsString()
  bio: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  specialties: string[];

  @Field(() => String, { nullable: true })
  @Column({ name: 'teaching_methods', type: 'text', nullable: true })
  teachingMethods: string[];

  @Field(() => Number)
  @Column({ name: 'year_of_experience', type: 'int' })
  yearOfExperience: number;

  @Field(() => String)
  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: CoachVerificationStatus,
    default: CoachVerificationStatus.UNVERIFIED,
  })
  verificationStatus: CoachVerificationStatus;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Field(() => UserDto, { nullable: true })
  @ManyToOne(() => User, (user) => user.coach, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @OneToMany(() => Credential, (credential) => credential.coach, {
    eager: true,
    cascade: ['insert'],
  })
  credentials: Credential[];
}

@ObjectType()
export class PaginatedCoach extends PaginatedResource(Coach) {}
