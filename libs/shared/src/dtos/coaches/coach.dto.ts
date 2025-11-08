import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MonthlyRevenueData {
  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsNumber()
  revenue: number;
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
