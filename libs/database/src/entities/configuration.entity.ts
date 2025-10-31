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
import { User } from './user.entity';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';

@ObjectType()
@Entity('configurations')
export class Configuration {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  key: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  @IsString()
  description?: string;

  @Field(() => String)
  @Column({
    name: 'data_type',
    type: 'enum',
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string',
  })
  @IsEnum(['string', 'number', 'boolean', 'json'])
  dataType: 'string' | 'number' | 'boolean' | 'json';

  @Field(() => GqlCustomDateTime)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => GqlCustomDateTime)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.createdConfigurations)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.updatedConfigurations)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;
}

@ObjectType()
export class PaginatedConfiguration extends PaginatedResource(Configuration) {}
