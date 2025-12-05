import { CourseCredentialType } from '@app/shared/enums/course.enum';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBaseCredentialDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsEnum(CourseCredentialType)
  type: CourseCredentialType;
}

export class UpdateBaseCredentialDto extends PartialType(
  CreateBaseCredentialDto,
) {}
