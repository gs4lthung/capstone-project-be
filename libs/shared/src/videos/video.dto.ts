import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({
    description: 'The title of the video',
    example: 'Introduction to Pickleball',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    description: 'The description of the video',
    example: 'Basic introduction to pickleball rules and techniques',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duration of the video in seconds' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Tags for the video',
    example: ['beginner', 'basics', 'rules'],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'The name of the drill',
    example: 'Basic Serve Practice',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  drillName?: string;

  @ApiProperty({
    description: 'The description of the drill',
    example: 'Practice serving techniques',
    required: false,
  })
  @IsOptional()
  @IsString()
  drillDescription?: string;

  @ApiProperty({
    description: 'Practice sets for the drill',
    example: '3 sets of 10 serves',
    required: false,
  })
  @IsOptional()
  @IsString()
  drillPracticeSets?: string;
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}
