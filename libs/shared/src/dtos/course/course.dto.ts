import { CourseLearningFormat } from '@app/shared/enums/course.enum';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ArrayNotEmpty,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'The ID of the court where the course will take place',
    example: 5,
  })
  @IsNotEmpty()
  @IsInt()
  court: number;

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
