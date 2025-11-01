import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectCoachDto {
  @ApiProperty({ example: 'Insufficient credentials', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
