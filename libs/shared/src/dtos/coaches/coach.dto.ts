import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum AnalysisType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  PREVIOUSLY = 'previously',
  YEARLY = 'yearly',
}

export class AnalysisData {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  data: number;

  @IsOptional()
  @IsNumber()
  increaseFromLast?: number;
}

export class AnalysisResponseDto {
  data: AnalysisData[];
}
export class MonthlyRequestDto {
  @ApiProperty({
    example: 2025,
    description: 'The year for which to retrieve monthly revenue data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({
    example: 1,
    description: 'The month for which to retrieve revenue data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  month?: number;
}

export class YearlyRequestDto {
  @ApiProperty({
    example: 2025,
    description: 'The year for which to retrieve yearly revenue data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  year?: number;
}

export class WeeklyRequestDto {
  @ApiProperty({
    example: 2025,
    description: 'The year for which to retrieve weekly data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({
    example: 1,
    description: 'The month for which to retrieve weekly data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiProperty({
    example: 1,
    description: 'The week number for which to retrieve data (1-5)',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  week?: number;
}

export class PreviouslyRequestDto {
  @ApiProperty({
    example: 2025,
    description: 'The year for which to retrieve data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({
    example: 1,
    description: 'The month for which to retrieve data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiProperty({
    example: 1,
    description: 'The day for which to retrieve data',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  day?: number;
}
