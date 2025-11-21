import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class ComparisonPlayer {
  @ApiProperty({
    description: 'Analysis text',
    example: 'HLV có tư thế chuẩn bị thấp...',
  })
  @IsOptional()
  @IsString()
  analysis?: string;

  @ApiProperty({
    description: 'List of strengths',
    example: ['Vị trí chân rộng rãi'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiProperty({
    description: 'List of weaknesses',
    example: ['Vợt chưa đặt thấp đủ'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weaknesses?: string[];

  @ApiProperty({ description: 'Timestamp in seconds', example: 0 })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

class ComparisonPhase {
  @ApiProperty({
    type: ComparisonPlayer,
    description: 'Coach (player1) analysis',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComparisonPlayer)
  player1?: ComparisonPlayer;

  @ApiProperty({
    type: ComparisonPlayer,
    description: 'Learner (player2) analysis',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComparisonPlayer)
  player2?: ComparisonPlayer;

  @ApiProperty({
    description: 'Advantage description',
    example: 'HLV có lợi thế...',
  })
  @IsOptional()
  @IsString()
  advantage?: string;
}

class Comparison {
  @ApiProperty({
    type: ComparisonPhase,
    description: 'Preparation phase comparison',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComparisonPhase)
  preparation?: ComparisonPhase;

  @ApiProperty({
    type: ComparisonPhase,
    description: 'Swing and contact phase comparison',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComparisonPhase)
  swingAndContact?: ComparisonPhase;

  @ApiProperty({
    type: ComparisonPhase,
    description: 'Follow through phase comparison',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComparisonPhase)
  followThrough?: ComparisonPhase;
}

class KeyDifference {
  @ApiProperty({ description: 'Aspect name', example: 'Tư thế chuẩn bị' })
  @IsString()
  aspect: string;

  @ApiProperty({
    description: 'Impact description',
    example: 'Tư thế của HLV tối ưu hóa...',
  })
  @IsString()
  impact: string;

  @ApiProperty({
    description: 'Coach technique',
    example: 'Thấp, sẵn sàng, vợt chủ động.',
  })
  @IsString()
  coachTechnique: string;

  @ApiProperty({
    description: 'Learner technique',
    example: 'Hơi cao, vợt chưa đặt ở vị trí tối ưu.',
  })
  @IsString()
  learnerTechnique: string;
}

class RecommendationDrill {
  @ApiProperty({
    description: 'Drill title',
    example: 'Tư thế phòng thủ cơ bản',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Drill description',
    example: 'Đứng thẳng, sau đó trùng gối...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Practice sets', example: '4x15 lần' })
  @IsOptional()
  @IsString()
  practice_sets?: string;
}

class Recommendation {
  @ApiProperty({
    description: 'Recommendation text',
    example: 'Cải thiện tư thế chuẩn bị...',
  })
  @IsString()
  recommendation: string;

  @ApiProperty({ type: RecommendationDrill, description: 'Drill information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationDrill)
  drill?: RecommendationDrill;
}

export class SaveAiFeedbackDto {
  @ApiProperty({
    description: 'Summary of the analysis',
    example: 'Học viên cần cải thiện...',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    description: 'Overall score for learner (0-100)',
    example: 65,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScoreForPlayer2?: number;

  @ApiProperty({
    type: Comparison,
    description: 'Detailed comparison between coach and learner',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Comparison)
  comparison?: Comparison;

  @ApiProperty({
    type: [KeyDifference],
    description: 'Key differences between coach and learner',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyDifference)
  keyDifferences?: KeyDifference[];

  @ApiProperty({
    type: [Recommendation],
    description: 'Recommendations for the learner',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Recommendation)
  recommendationsForPlayer2?: Recommendation[];

  @ApiProperty({
    description: 'Coach note',
    example: 'Cần luyện tập thêm...',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  coachNote?: string | null;
}
