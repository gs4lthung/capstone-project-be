import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCredentialType } from '@app/shared/enums/course.enum';
import { PartialType } from '@nestjs/mapped-types';

export class RegisterCoachCredentialDto {
  @ApiProperty({ example: 'USPTA Certified Professional' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Certification for tennis coaching',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CourseCredentialType })
  @IsNotEmpty()
  type: CourseCredentialType;

  @ApiProperty({
    example: 'https://example.com/certificate.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  publicUrl?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  @IsOptional()
  issuedAt?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', required: false })
  @IsOptional()
  expiresAt?: Date;
}

export class CoachProfileDto {
  @ApiProperty({ example: 'I have 10 years of experience coaching tennis.' })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    type: [String],
    example: ['Backhand', 'Serve'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({
    type: [String],
    example: ['Online', 'In-person'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teachingMethods?: string[];

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  @Max(80)
  yearOfExperience: number;

  @ApiProperty({ type: [RegisterCoachCredentialDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegisterCoachCredentialDto)
  credentials?: RegisterCoachCredentialDto[];
}

export class RegisterCoachDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'coach@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @ApiProperty({ example: 'Password123@' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be strong (at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol)',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Province ID of the learner',
    example: 1,
  })
  @IsNotEmpty({ message: 'Province ID is required' })
  province: number;

  @ApiProperty({
    description: 'District ID of the learner',
    example: 10,
  })
  @IsNotEmpty({ message: 'District ID is required' })
  district: number;

  coach: CoachProfileDto;
}

export class UpdateCoachProfileDto extends PartialType(CoachProfileDto) {}

export class UpdateCredentialDto extends PartialType(
  RegisterCoachCredentialDto,
) {}
