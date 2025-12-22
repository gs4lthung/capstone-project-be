import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateQuestionOptionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  content: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionOptionDto)
  options: UpdateQuestionOptionDto[];
}

export class UpdateQuizDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions: UpdateQuestionDto[];
}

export class UpdateVideoDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  drillName?: string;

  @IsString()
  @IsOptional()
  drillDescription?: string;

  @IsString()
  @IsOptional()
  drillPracticeSets?: string;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  lessonNumber: number;

  @ValidateNested()
  @Type(() => UpdateVideoDto)
  video: UpdateVideoDto;

  @ValidateNested()
  @Type(() => UpdateQuizDto)
  quiz: UpdateQuizDto;
}

export class UpdateAiGeneratedSubjectDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsEnum(PickleballLevel)
  level: PickleballLevel;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateLessonDto)
  lessons: UpdateLessonDto[];
}
