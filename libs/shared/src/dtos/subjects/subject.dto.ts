import { PickleballLevel } from '@app/shared/enums/pickleball.enum';
import { SubjectStatus } from '@app/shared/enums/subject.enum';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ type: String, example: 'Cơ bản môn Pickleball' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    type: String,
    example:
      'Môn Pickleball của tôi là một loại game được sử dụng để giải quyết các vấn đề trong quá trình học.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    type: String,
    enum: PickleballLevel,
    example: PickleballLevel.BEGINNER,
  })
  @IsEnum(PickleballLevel)
  level: PickleballLevel;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  @ApiProperty({
    type: String,
    enum: SubjectStatus,
    example: SubjectStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;
}
