import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateQuestionOptionDto {
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

export class CreateQuestionDto {
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

export class CreateQuizDto {
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

export class UpdateQuizDto extends PartialType(CreateQuizDto) {}

export class LearnerAnswerDto {
  @ApiProperty({
    description: 'The ID of the question being answered',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  question: number;
  @ApiProperty({
    description: 'The ID of the selected option for the question',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  questionOption: number;
}
export class LearnerAttemptQuizDto {
  @ApiProperty({
    description: 'The answers provided by the learner',
    example: [
      { questionId: 1, selectedOptionId: 3 },
      { questionId: 2, selectedOptionId: 5 },
    ],
  })
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => LearnerAnswerDto)
  learnerAnswers: LearnerAnswerDto[];
}
