import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourtDto {
  @ApiProperty({
    description: 'Name of the court',
    example: 'Sân Pickleball Quận 1',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Phone number of the court',
    example: '+84901234567',
  })
  @IsOptional()
  @Matches(/^\+84[0-9]{9,10}$/, {
    message:
      'Phone number must be a valid Vietnamese phone number (e.g., +84155018243)',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Price per hour in VND',
    example: 100000,
    minimum: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pricePerHour: number;

  @ApiPropertyOptional({
    description: 'Public URL of the court image',
    example: 'https://example.com/court-image.jpg',
  })
  @IsOptional()
  @IsString()
  publicUrl?: string;

  @ApiProperty({
    description: 'Address of the court',
    example: '123 Đường ABC, Phường XYZ',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Is court active/available',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 10.762622,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a number' })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: 106.660172,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a number' })
  longitude?: number;

  @ApiProperty({
    description: 'Province ID where the court is located',
    example: 79,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  provinceId: number;

  @ApiProperty({
    description: 'District ID where the court is located',
    example: 760,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  districtId: number;
}

export class UpdateCourtDto extends PartialType(CreateCourtDto) {}