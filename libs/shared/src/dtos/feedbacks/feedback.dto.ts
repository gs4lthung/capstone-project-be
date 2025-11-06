import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Comment for the feedback',
    example: 'Great course, learned a lot!',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'Rating for the feedback (1-5)',
    example: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Whether the feedback is anonymous',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {}
