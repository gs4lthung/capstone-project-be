import { Achievement } from '@app/database/entities/achievement.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * ========================
 * ACHIEVEMENT TYPE ENUM
 * ========================
 * Enum này định nghĩa 3 loại achievement:
 * - EVENT_COUNT: Đếm số lần sự kiện (VD: hoàn thành 50 bài học)
 * - STREAK: Chuỗi liên tiếp (VD: login 7 ngày liên tiếp)
 * - PROPERTY_CHECK: Kiểm tra điều kiện (VD: điểm TB >= 80)
 */
export enum AchievementType {
  EVENT_COUNT = 'EVENT_COUNT',
  STREAK = 'STREAK',
  PROPERTY_CHECK = 'PROPERTY_CHECK',
}

/**
 * ========================
 * BASE CREATE DTO
 * ========================
 * DTO này chứa các fields CHUNG cho TẤT CẢ loại achievement
 * Các DTO con sẽ kế thừa và thêm fields riêng
 */
export class CreateAchievementDto {
  @ApiProperty({
    description: 'Tên achievement',
    example: 'First Steps',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả achievement',
    example: 'Complete your first lesson',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL icon của achievement',
    example: 'https://example.com/icons/first-steps.png',
  })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái active của achievement',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * ========================
 * EVENT COUNT ACHIEVEMENT DTO
 * ========================
 * DTO để tạo achievement kiểu "đếm số lần"
 * Ví dụ: "Hoàn thành 50 bài học", "Tham gia 10 buổi học"
 */
export class CreateEventCountAchievementDto extends CreateAchievementDto {
  @ApiProperty({
    description: 'Tên sự kiện cần track (VD: LESSON_COMPLETED, SESSION_ATTENDED)',
    example: 'LESSON_COMPLETED',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  eventName: string;

  @ApiProperty({
    description: 'Số lần sự kiện cần đạt để hoàn thành achievement',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  targetCount: number;
}

/**
 * ========================
 * STREAK ACHIEVEMENT DTO
 * ========================
 * DTO để tạo achievement kiểu "chuỗi liên tiếp"
 * Ví dụ: "Login 7 ngày liên tiếp", "Học 30 ngày liên tiếp"
 */
export class CreateStreakAchievementDto extends CreateAchievementDto {
  @ApiProperty({
    description: 'Tên sự kiện cần track (VD: DAILY_LOGIN, DAILY_PRACTICE)',
    example: 'DAILY_LOGIN',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(25)
  eventName: string;

  @ApiProperty({
    description: 'Độ dài chuỗi cần đạt (VD: 7 ngày, 30 ngày)',
    example: 7,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  targetStreakLength: number;

  @ApiProperty({
    description: 'Đơn vị thời gian (days, weeks, months)',
    example: 'days',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(25)
  streakUnit: string;
}

/**
 * ========================
 * PROPERTY CHECK ACHIEVEMENT DTO
 * ========================
 * DTO để tạo achievement kiểu "kiểm tra điều kiện"
 * Ví dụ: "Điểm trung bình >= 80", "Rating >= 4.5"
 */
export class CreatePropertyCheckAchievementDto extends CreateAchievementDto {
  @ApiProperty({
    description: 'Tên sự kiện trigger việc check (VD: QUIZ_COMPLETED, COURSE_RATED)',
    example: 'QUIZ_COMPLETED',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(25)
  eventName: string;

  @ApiProperty({
    description: 'Tên entity cần check (VD: LearnerProgress, Coach)',
    example: 'LearnerProgress',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(25)
  entityName: string;

  @ApiProperty({
    description: 'Tên property cần check (VD: avgQuizScore, averageRating)',
    example: 'avgQuizScore',
    minLength: 2,
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(25)
  propertyName: string;

  @ApiProperty({
    description: 'Toán tử so sánh: ==, !=, >, <, >=, <=',
    example: '>=',
    minLength: 1,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2)
  comparisonOperator: string;

  @ApiProperty({
    description: 'Giá trị cần đạt (dạng string, sẽ parse sau)',
    example: '80',
  })
  @IsString()
  @IsNotEmpty()
  targetValue: string;
}

/**
 * ========================
 * UPDATE DTO
 * ========================
 * DTO để update achievement
 * Dùng PartialType để tất cả fields đều optional
 * 
 * NOTE: Không thể đổi TYPE của achievement sau khi tạo!
 * Chỉ có thể update: name, description, iconUrl, isActive, và các target values
 */
export class UpdateEventCountAchievementDto {
  @ApiPropertyOptional({ description: 'Tên achievement' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon URL' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Trạng thái active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Tên sự kiện' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  eventName?: string;

  @ApiPropertyOptional({ description: 'Số lần cần đạt', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetCount?: number;
}

export class UpdateStreakAchievementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  eventName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetStreakLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  streakUnit?: string;
}

export class UpdatePropertyCheckAchievementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  eventName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  entityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  propertyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2)
  comparisonOperator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetValue?: string;
}

/**
 * ========================
 * PAGINATED ACHIEVEMENT (GraphQL)
 * ========================
 * DTO cho pagination response (dùng cho GraphQL)
 * Kế thừa từ PaginatedResource để có sẵn fields: items, total, page, pageSize
 */
@ObjectType()
export class PaginatedAchievement extends PaginatedResource(Achievement) {}

