import { Achievement } from '@app/database/entities/achievement.entity';
import { PaginatedResource } from '@app/shared/graphql/paginated-resource';
import { ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
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
 * ACHIEVEMENT DTO (Response Model)
 * ========================
 * DTO này dùng để trả về thông tin achievement từ API
 * Chứa tất cả fields cần thiết để hiển thị achievement
 */
export class AchievementDto {
  @ApiProperty({ description: 'Achievement ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Achievement name', example: 'First Steps' })
  name: string;

  @ApiPropertyOptional({
    description: 'Achievement description',
    example: 'Complete your first lesson',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon URL',
    example: 'https://example.com/icon.png',
  })
  iconUrl?: string;

  @ApiProperty({ description: 'Is achievement active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({
    description: 'Achievement type',
    example: 'EVENT_COUNT',
    enum: AchievementType,
  })
  type: string;
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
    description:
      'Tên sự kiện cần track (VD: LESSON_COMPLETED, SESSION_ATTENDED)',
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
    description:
      'Tên sự kiện trigger việc check (VD: QUIZ_COMPLETED, COURSE_RATED)',
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

// =====================================================================================================================
// ACHIEVEMENT PROGRESS DTOs (Phần 2: User Progress)
// =====================================================================================================================

/**
 * DTO cho Achievement Progress (tiến độ của user với 1 achievement)
 */
export class AchievementProgressDto {
  @ApiProperty({ description: 'Progress ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Current progress percentage (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  currentProgress: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Achievement ID', example: 1 })
  achievementId: number;

  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;
}

/**
 * DTO kết hợp Achievement + Progress của user
 * Dùng để hiển thị danh sách progress của user
 */
export class UserAchievementProgressDto {
  @ApiProperty({ description: 'Achievement information', type: AchievementDto })
  achievement: AchievementDto;

  @ApiProperty({
    description: 'Current progress percentage (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  currentProgress: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether the achievement has been earned (progress = 100)',
    example: false,
  })
  isEarned: boolean;
}

/**
 * Paginated response cho User Achievement Progress
 */
export class PaginatedUserAchievementProgress {
  @ApiProperty({ type: [UserAchievementProgressDto] })
  data: UserAchievementProgressDto[];

  @ApiProperty({ description: 'Total number of records', example: 50 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;
}

// =====================================================================================================================
// EARNED ACHIEVEMENT DTOs (Phần 3: Earned Achievements)
// =====================================================================================================================

/**
 * DTO cho Achievement đã đạt được (earned)
 * Bao gồm thông tin achievement và thời điểm đạt được
 */
export class EarnedAchievementDto {
  @ApiProperty({ description: 'Learner Achievement ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Achievement information', type: AchievementDto })
  achievement: AchievementDto;

  @ApiProperty({ description: 'Date when achievement was earned' })
  earnedAt: Date;

  @ApiProperty({
    description: 'User ID who earned this achievement',
    example: 5,
  })
  userId: number;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Nguyen Van A',
  })
  userFullName?: string;
}

/**
 * Paginated response cho Earned Achievements
 */
export class PaginatedEarnedAchievement {
  @ApiProperty({ type: [EarnedAchievementDto] })
  data: EarnedAchievementDto[];

  @ApiProperty({ description: 'Total number of records', example: 15 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages', example: 2 })
  totalPages: number;
}

// ============================================
// PART 4: STATISTICS & LEADERBOARD DTOs
// ============================================

/**
 * General Achievement Statistics (Public)
 */
export class AchievementStatsDto {
  @ApiProperty({ description: 'Total number of achievements', example: 50 })
  totalAchievements: number;

  @ApiProperty({ description: 'Number of EVENT_COUNT achievements', example: 20 })
  totalEventCount: number;

  @ApiProperty({ description: 'Number of STREAK achievements', example: 15 })
  totalStreak: number;

  @ApiProperty({ description: 'Number of PROPERTY_CHECK achievements', example: 15 })
  totalPropertyCheck: number;

  @ApiProperty({ description: 'Number of active achievements', example: 45 })
  activeAchievements: number;
}

/**
 * Last Earned Achievement Info
 */
export class LastEarnedAchievementDto {
  @ApiProperty({ description: 'Achievement name', example: 'Week Warrior' })
  name: string;

  @ApiProperty({ description: 'When the achievement was earned', example: '2025-01-15T00:00:00.000Z' })
  earnedAt: Date;
}

/**
 * User Achievement Statistics (Authenticated User)
 */
export class UserAchievementStatsDto {
  @ApiProperty({ description: 'Total achievements earned', example: 12 })
  totalEarned: number;

  @ApiProperty({ description: 'Total achievements in progress', example: 8 })
  totalInProgress: number;

  @ApiProperty({ description: 'Completion rate (0-100)', example: 60, minimum: 0, maximum: 100 })
  completionRate: number;

  @ApiPropertyOptional({ description: 'Last earned achievement', type: LastEarnedAchievementDto })
  lastEarned?: LastEarnedAchievementDto;
}

/**
 * User Info for Leaderboard
 */
export class LeaderboardUserDto {
  @ApiProperty({ description: 'User ID', example: 5 })
  id: number;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  fullName: string;

  @ApiPropertyOptional({ description: 'User avatar URL', example: 'https://example.com/avatar.jpg' })
  avatar?: string;
}

/**
 * Leaderboard Entry
 */
export class LeaderboardEntryDto {
  @ApiProperty({ description: 'User rank', example: 1 })
  rank: number;

  @ApiProperty({ description: 'User information', type: LeaderboardUserDto })
  user: LeaderboardUserDto;

  @ApiProperty({ description: 'Total achievements earned', example: 45 })
  totalEarned: number;

  @ApiProperty({ description: 'Last earned achievement date', example: '2025-01-15T00:00:00.000Z' })
  lastEarnedAt: Date;
}

/**
 * Leaderboard Response
 */
export class LeaderboardResponseDto {
  @ApiProperty({ description: 'Leaderboard entries', type: [LeaderboardEntryDto] })
  items: LeaderboardEntryDto[];

  @ApiProperty({ description: 'Total number of users with achievements', example: 100 })
  total: number;
}
