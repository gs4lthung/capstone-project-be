import { CourseCredentialType } from '@app/shared/enums/course.enum';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Credential } from './credential.entity';

@Entity('base_credentials')
export class BaseCredential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @Column({ type: 'enum', enum: CourseCredentialType })
  @IsEnum(CourseCredentialType)
  type: CourseCredentialType;

  @Column({ name: 'public_url', type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  publicUrl?: string;

  @OneToMany(() => Credential, (credential) => credential.baseCredential)
  credentials: Credential[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
