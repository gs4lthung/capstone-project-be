import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MonthlyData {
  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsNumber()
  data: number;

  @IsOptional()
  @IsNumber()
  increaseFromLastMonth?: number;
}

export class MonthlyResponseDto {
  data: MonthlyData[];
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
