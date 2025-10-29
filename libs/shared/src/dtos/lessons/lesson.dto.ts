import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateQuestionOptionDto {
  @ApiProperty({
    description: 'The content of the question option',
    example: 'Option 1',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Whether this option is the correct answer',
    example: false,
  })
  @IsBoolean()
  isCorrect: boolean;
}

class CreateQuestionDto {
  @ApiProperty({
    description: 'The title of the question',
    example: 'What is the capital of France?',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Explanation for the correct answer',
    example: 'Paris is the capital city of France',
    required: false,
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({
    description: 'The options for the question',
    example: [
      { content: 'London', isCorrect: false },
      { content: 'Paris', isCorrect: true },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  options?: CreateQuestionOptionDto[];
}

class CreateQuizDto {
  @ApiProperty({
    description: 'The title of the quiz',
    example: 'Pickleball Rules Quiz',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    description: 'The description of the quiz',
    example: 'Test your knowledge of pickleball rules',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The questions for the quiz',
    example: [
      {
        title: 'What is the correct score to win a pickleball game?',
        options: [
          { content: '11 points', isCorrect: true },
          { content: '15 points', isCorrect: false },
          { content: '21 points', isCorrect: false },
        ],
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

class CreateVideoDto {
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

  @ApiProperty({
    description: 'The quiz associated with this lesson',
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateQuizDto)
  quiz: CreateQuizDto;

  @ApiProperty({
    description: 'The video associated with this lesson',
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateVideoDto)
  video: CreateVideoDto;
}
