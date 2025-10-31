import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCredentialType } from '@app/shared/enums/course.enum';

class RegisterCoachCredentialDto {
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
}

export class RegisterCoachDto {
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

  @ApiProperty({ type: [Number], example: [1, 2, 3], required: true })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  subjectIds: number[];

  @ApiProperty({ type: [RegisterCoachCredentialDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegisterCoachCredentialDto)
  credentials?: RegisterCoachCredentialDto[];
}
