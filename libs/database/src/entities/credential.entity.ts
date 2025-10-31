import { CourseCredentialType } from '@app/shared/enums/course.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { GqlCustomDateTime } from '@app/shared/graphql/scalars/gql-custom-datetime.scalar';
import { Coach } from './coach.entity';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('credentials')
export class Credential {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: CourseCredentialType })
  @IsEnum(CourseCredentialType)
  type: CourseCredentialType;

  @Field(() => String, { nullable: true })
  @Column({ name: 'public_url', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  publicUrl?: string;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @Column({ name: 'issued_at', type: 'date', nullable: true })
  issuedAt?: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt?: Date;

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => GqlCustomDateTime, { nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Field(() => Coach)
  @ManyToOne(() => Coach, (coach) => coach.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}

@ObjectType()
export class PaginatedCredential extends PaginatedResource(Credential) {}
