// src/courses/dto/create-course.dto.ts
import { CourseLearningFormat } from '@app/shared/enums/course.enum';
import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType } from '@nestjs/graphql';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { Course } from '@app/database/entities/course.entity';

class CreateScheduleDto {
  @ApiProperty({
    description: 'The day of the week',
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    example: 'Monday',
  })
  @IsEnum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ])
  dayOfWeek: string;

  @ApiProperty({
    description: 'The start time of the schedule',
    example: '09:00:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'The end time of the schedule',
    example: '11:00:00',
  })
  endTime: string;
}

export class CreateCourseRequestDto {
  @ApiProperty({
    description: 'The name of the course',
    example: 'Pickleball Fundamentals',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The description of the course',
    example: 'Learn the basics of Pickleball',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    description: 'The level of the course',
    enum: PickleballLevel,
    example: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  level: PickleballLevel;

  @ApiProperty({
    description: 'The learning format of the course',
    enum: CourseLearningFormat,
    example: CourseLearningFormat.GROUP,
  })
  @IsEnum(CourseLearningFormat)
  learningFormat: CourseLearningFormat;

  @ApiProperty({
    description: 'The minimum number of participants',
    example: 1,
  })
  @IsInt()
  @Min(1)
  minParticipants: number;

  @ApiProperty({
    description: 'The maximum number of participants',
    example: 10,
  })
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({
    description: 'The price per participant',
    example: 1_500_000,
  })
  @IsInt()
  @Min(0)
  pricePerParticipant: number;

  @ApiProperty({
    description: 'The start date of the course',
    example: '2024-01-15',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'The schedules of the course',
    example: [
      {
        dayOfWeek: 'Monday',
        startTime: '09:00:00',
        endTime: '11:00:00',
      },
    ],
  })
  @IsOptional()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  schedules?: CreateScheduleDto[];
}

export class UpdateCourseDto extends PartialType(CreateCourseRequestDto) {}

@ObjectType()
export class PaginatedCourse extends PaginatedResource(Course) {}
