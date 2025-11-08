import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MonthlyRevenueData {
  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsNumber()
  revenue: number;

  @IsOptional()
  @IsNumber()
  increaseFromLastMonth?: number;
}

export class CoachMonthlyRevenueResponseDto {
  data: MonthlyRevenueData[];
}

export class CoachMonthlyRevenueRequestDto {
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

export class MonthlyLearnerData {
  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsNumber()
  learnerCount: number;

  @IsOptional()
  @IsNumber()
  increaseFromLastMonth?: number;
}
export class CoachMonthlyLearnerResponseDto {
  data: MonthlyLearnerData[];
}

export class CoachMonthlyLearnerRequestDto {
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
export class MonthlySessionData {
  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsNumber()
  sessionCount: number;

  @IsOptional()
  @IsNumber()
  increaseFromLastMonth?: number;
}
export class CoachMonthlySessionResponseDto {
  data: MonthlySessionData[];
}

export class CoachMonthlySessionRequestDto {
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
export class MonthlyCourseData {
  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsNumber()
  courseCount: number;

  @IsOptional()
  @IsNumber()
  increaseFromLastMonth?: number;
}
export class CoachMonthlyCourseResponseDto {
  data: MonthlyCourseData[];
}

export class CoachMonthlyCourseRequestDto {
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
