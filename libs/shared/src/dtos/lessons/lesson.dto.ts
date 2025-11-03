import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLessonRequestDto {
  @ApiProperty({
    description: 'The name of the lesson',
    example: 'Introduction to Pickleball',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The description of the lesson',
    example: 'Learn the basics of pickleball',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    description: 'The duration of the lesson in minutes',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  duration?: number;
}

export class UpdateLessonDto extends PartialType(CreateLessonRequestDto) {}
