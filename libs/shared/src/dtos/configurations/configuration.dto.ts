import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateConfigurationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  key: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['string', 'number', 'boolean', 'json'])
  dataType: 'string' | 'number' | 'boolean' | 'json';
}

export class UpdateConfigurationDto extends PartialType(
  CreateConfigurationDto,
) {}
