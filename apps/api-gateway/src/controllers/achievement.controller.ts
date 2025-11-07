import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AchievementService } from '../services/achievement.service';
import {
  CreateEventCountAchievementDto,
  CreateStreakAchievementDto,
  CreatePropertyCheckAchievementDto,
  UpdateEventCountAchievementDto,
  UpdateStreakAchievementDto,
  UpdatePropertyCheckAchievementDto,
  PaginatedUserAchievementProgress,
  UserAchievementProgressDto,
  PaginatedEarnedAchievement,
  AchievementStatsDto,
  UserAchievementStatsDto,
  LeaderboardResponseDto,
} from '@app/shared/dtos/achievements/achievement.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CheckRoles } from '@app/shared/decorators/check-roles.decorator';
import { UserRole } from '@app/shared/enums/user.enum';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Achievement } from '@app/database/entities/achievement.entity';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { Pagination } from '@app/shared/interfaces/pagination.interface';

/**
 * ============================================
 * ACHIEVEMENT CONTROLLER
 * ============================================
 * Controller này expose các REST API endpoints cho Achievement Management
 *
 * Base URL: /api/v1/achievements
 *
 * Endpoints:
 * - POST   /event-count          → Tạo EVENT_COUNT achievement
 * - POST   /streak               → Tạo STREAK achievement
 * - POST   /property-check       → Tạo PROPERTY_CHECK achievement
 * - GET    /                     → List all achievements (paginated)
 * - GET    /:id                  → Get achievement by ID
 * - PUT    /event-count/:id      → Update EVENT_COUNT achievement
 * - PUT    /streak/:id           → Update STREAK achievement
 * - PUT    /property-check/:id   → Update PROPERTY_CHECK achievement
 * - DELETE /:id                  → Delete achievement
 * - PATCH  /:id/activate         → Activate achievement
 * - PATCH  /:id/deactivate       → Deactivate achievement
 */

/**
 * @Controller('achievements')
 * → Định nghĩa base path cho tất cả routes trong controller này
 * → URL: /api/v1/achievements (prefix /api/v1 được set trong main.ts)
 */
@Controller('achievements')
/**
 * @ApiTags('Achievements')
 * → Group tất cả endpoints này vào 1 section trong Swagger UI
 * → Giúp organize documentation dễ đọc hơn
 */
@ApiTags('Achievements')
export class AchievementController {
  // Pagination constants
  private static readonly MAX_PAGE_SIZE = 100;
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly DEFAULT_PAGE = 1;

  /**
   * Constructor injection
   * → Inject AchievementService để gọi business logic
   * → NestJS tự động resolve dependency
   */
  constructor(private readonly achievementService: AchievementService) {}

  // ============================================
  // CREATE ENDPOINTS (3 types)
  // ============================================

  /**
   * CREATE EVENT COUNT ACHIEVEMENT
   * ────────────────────────────────────────────
   * POST /api/v1/achievements/event-count
   *
   * Tạo achievement kiểu "đếm số lần sự kiện"
   * VD: "Hoàn thành 50 bài học", "Tham gia 10 buổi học"
   *
   * @param data - CreateEventCountAchievementDto từ request body
   * @returns CustomApiResponse với status 201 CREATED
   *
   * Authentication: Required (JWT token)
   * Authorization: ADMIN only
   *
   * Request example:
   * {
   *   "name": "Lesson Master",
   *   "description": "Complete 50 lessons",
   *   "iconUrl": "https://...",
   *   "eventName": "LESSON_COMPLETED",
   *   "targetCount": 50
   * }
   *
   * Response: 201 CREATED
   * {
   *   "statusCode": 201,
   *   "message": "ACHIEVEMENT.CREATE_SUCCESS",
   *   "metadata": null
   * }
   */
  @Post('event-count')

  /**
   * @HttpCode(HttpStatus.CREATED)
   * → Set status code 201 (mặc định POST là 201, nhưng explicit rõ ràng hơn)
   */
  @HttpCode(HttpStatus.CREATED)

  /**
   * @ApiBearerAuth()
   * → Swagger UI sẽ hiện nút "Authorize" để nhập JWT token
   * → Token format: "Bearer <your-jwt-token>"
   */
  @ApiBearerAuth()

  /**
   * @ApiOperation()
   * → Mô tả endpoint trong Swagger documentation
   */
  @ApiOperation({
    summary: 'Create EVENT_COUNT achievement',
    description:
      'Create a new achievement that tracks event count (e.g., complete 50 lessons)',
  })

  /**
   * @ApiResponse()
   * → Định nghĩa các response codes có thể xảy ra
   */
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Achievement created successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User is not ADMIN',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid input data',
  })

  /**
   * @CheckRoles(UserRole.ADMIN)
   * → Chỉ user có role ADMIN mới được gọi endpoint này
   * → Decorator này set metadata 'roles' = ['ADMIN']
   */
  @CheckRoles(UserRole.ADMIN)

  /**
   * @UseGuards(AuthGuard, RoleGuard)
   * → AuthGuard: Check JWT token hợp lệ, extract user info
   * → RoleGuard: Check user có role phù hợp không
   * → Guards chạy theo thứ tự: AuthGuard → RoleGuard
   */
  @UseGuards(AuthGuard, RoleGuard)

  /**
   * async createEventCount(@Body() data)
   *
   * @Body() decorator:
   * → Extract request body và validate theo DTO
   * → Nếu validation fail → tự động return 400 Bad Request
   *
   * Validation flow:
   * 1. Client gửi JSON body
   * 2. NestJS parse JSON → object
   * 3. Validate theo decorators trong DTO (@IsString, @MinLength, etc.)
   * 4. Nếu pass → gọi method này
   * 5. Nếu fail → throw ValidationError
   */
  async createEventCount(
    @Body() data: CreateEventCountAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    // Gọi service method để xử lý business logic
    return this.achievementService.createEventCount(data);
  }

  /**
   * CREATE STREAK ACHIEVEMENT
   * ────────────────────────────────────────────
   * POST /api/v1/achievements/streak
   *
   * Tạo achievement kiểu "chuỗi liên tiếp"
   * VD: "Login 7 ngày liên tiếp"
   */
  @Post('streak')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create STREAK achievement',
    description:
      'Create a new achievement that tracks consecutive streaks (e.g., login 7 days in a row)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Achievement created successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async createStreak(
    @Body() data: CreateStreakAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    return this.achievementService.createStreak(data);
  }

  /**
   * CREATE PROPERTY CHECK ACHIEVEMENT
   * ────────────────────────────────────────────
   * POST /api/v1/achievements/property-check
   *
   * Tạo achievement kiểu "kiểm tra điều kiện"
   * VD: "Điểm trung bình >= 80"
   */
  @Post('property-check')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create PROPERTY_CHECK achievement',
    description:
      'Create a new achievement that checks property conditions (e.g., average score >= 80)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Achievement created successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async createPropertyCheck(
    @Body() data: CreatePropertyCheckAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    return this.achievementService.createPropertyCheck(data);
  }

  // ============================================
  // READ ENDPOINTS
  // ============================================

  /**
   * GET ALL ACHIEVEMENTS
   * ────────────────────────────────────────────
   * GET /api/v1/achievements?page=1&pageSize=10&isActive=true
   *
   * Lấy danh sách achievements với pagination
   *
   * @param page - Trang hiện tại (default: 1)
   * @param pageSize - Số items mỗi trang (default: 10)
   * @returns PaginatedAchievement
   *
   * Authentication: NOT required (public endpoint)
   *
   * Query params:
   * - page: number (optional, default: 1)
   * - pageSize: number (optional, default: 10, max: 100)
   * - isActive: boolean (optional, filter by active status)
   * - type: string (optional, filter: EVENT_COUNT | STREAK | PROPERTY_CHECK)
   *
   * Response example:
   * {
   *   "items": [
   *     {
   *       "id": 1,
   *       "name": "First Steps",
   *       "description": "Complete your first lesson",
   *       "type": "EVENT_COUNT",
   *       "isActive": true,
   *       "createdAt": "2025-01-01T00:00:00Z"
   *     }
   *   ],
   *   "total": 50,
   *   "page": 1,
   *   "pageSize": 10
   * }
   */
  @Get()

  /**
   * @HttpCode(HttpStatus.OK)
   * → Set status code 200 (mặc định GET đã là 200)
   */
  @HttpCode(HttpStatus.OK)

  /**
   * @ApiQuery()
   * → Định nghĩa query parameters cho Swagger
   * → required: false → optional parameters
   */
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiOperation({
    summary: 'Get all achievements',
    description:
      'Retrieve paginated list of achievements with optional filters (Public - No authentication required)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievements retrieved successfully',
  })

  /**
   * async findAll(@Query() page, @Query() pageSize)
   *
   * @Query() decorator:
   * → Extract query parameters từ URL
   * → VD: /achievements?page=2&pageSize=20
   * → @Query('page') → 2
   * → @Query('pageSize') → 20
   *
   * Default values:
   * → page = 1 nếu không truyền
   * → pageSize = 10 nếu không truyền
   *
   * ⚠️ AUTHENTICATION REQUIRED
   * → User phải login (có JWT token)
   */
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    // Validate pageSize không vượt quá 100
    const validatedPageSize = Math.min(pageSize, 100);

    // Build findOptions object
    const findOptions = {
      pagination: {
        page: Number(page),
        size: Number(validatedPageSize),
        offset: (Number(page) - 1) * Number(validatedPageSize),
      },
    };

    return this.achievementService.findAll(findOptions);
  }

  // ============================================
  // STATISTICS & LEADERBOARD ENDPOINTS
  // ============================================
  // Note: These MUST come BEFORE @Get(':id') to avoid route conflicts
  // Otherwise "stats" and "leaderboard" will be interpreted as :id values

  /**
   * Get general achievement statistics
   * Public - No authentication required
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get achievement statistics',
    description:
      'Get general statistics about all achievements in the system (Public - No authentication required)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement statistics retrieved successfully',
    type: AchievementStatsDto,
  })
  async getStats(): Promise<AchievementStatsDto> {
    return this.achievementService.getStats();
  }

  /**
   * Get current user's achievement statistics
   * Authenticated endpoint - user can view their own stats
   */
  @Get('my-stats')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my achievement statistics',
    description:
      'Get personal achievement statistics for the current authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User achievement statistics retrieved successfully',
    type: UserAchievementStatsDto,
  })
  @UseGuards(AuthGuard)
  async getMyStats(): Promise<UserAchievementStatsDto> {
    return this.achievementService.getMyStats();
  }

  /**
   * Get achievement leaderboard
   * Public - No authentication required
   */
  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get achievement leaderboard',
    description:
      'Get top users with the most achievements earned (Public - No authentication required)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top users to return (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leaderboard retrieved successfully',
    type: LeaderboardResponseDto,
  })
  async getLeaderboard(
    @Query('limit') limit: number = 10,
  ): Promise<LeaderboardResponseDto> {
    const validatedLimit = Math.min(Math.max(limit, 1), 100);
    return this.achievementService.getLeaderboard(validatedLimit);
  }

  // =====================================================================================================================
  // USER ACHIEVEMENT PROGRESS ENDPOINTS
  // =====================================================================================================================
  // NOTE: These MUST come BEFORE @Get(':id') to avoid route conflicts

  @Get('my-progress')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my achievement progress',
    description:
      'Get all achievement progress for the current authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User achievement progress retrieved successfully',
    type: PaginatedUserAchievementProgress,
  })
  @UseGuards(AuthGuard)
  async getMyProgress(
    @Query('page') page: number = AchievementController.DEFAULT_PAGE,
    @Query('pageSize')
    pageSize: number = AchievementController.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedUserAchievementProgress> {
    const validatedPageSize = Math.min(
      pageSize,
      AchievementController.MAX_PAGE_SIZE,
    );
    const findOptions: FindOptions = {
      pagination: {
        page: page,
        size: validatedPageSize,
        offset: (page - 1) * validatedPageSize,
      } as Pagination,
    };
    return this.achievementService.getMyProgress(findOptions);
  }

  @Get('my-earned')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my earned achievements',
    description:
      'Get all achievements that the current user has earned (completed)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Earned achievements retrieved successfully',
    type: PaginatedEarnedAchievement,
  })
  @UseGuards(AuthGuard)
  async getMyEarnedAchievements(
    @Query('page') page: number = AchievementController.DEFAULT_PAGE,
    @Query('pageSize')
    pageSize: number = AchievementController.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedEarnedAchievement> {
    const validatedPageSize = Math.min(
      pageSize,
      AchievementController.MAX_PAGE_SIZE,
    );
    const findOptions: FindOptions = {
      pagination: {
        page: page,
        size: validatedPageSize,
        offset: (page - 1) * validatedPageSize,
      } as Pagination,
    };
    return this.achievementService.getMyEarnedAchievements(findOptions);
  }

  /**
   * GET ONE ACHIEVEMENT BY ID
   * ────────────────────────────────────────────
   * GET /api/v1/achievements/:id
   *
   * Lấy chi tiết 1 achievement theo ID
   *
   * @param id - Achievement ID từ URL path
   * @returns Achievement entity
   *
   * Authentication: NOT required (public endpoint)
   *
   * URL example: /api/v1/achievements/5
   *
   * Response example:
   * {
   *   "id": 5,
   *   "name": "Lesson Master",
   *   "description": "Complete 50 lessons",
   *   "type": "EVENT_COUNT",
   *   "eventName": "LESSON_COMPLETED",
   *   "targetCount": 50,
   *   "isActive": true,
   *   "createdBy": {
   *     "id": 1,
   *     "fullName": "Admin User"
   *   }
   * }
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)

  /**
   * @ApiParam()
   * → Định nghĩa path parameters cho Swagger
   */
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Achievement ID',
    example: 1,
  })
  @ApiOperation({
    summary: 'Get achievement by ID',
    description:
      'Retrieve detailed information about a specific achievement (Public - No authentication required)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Achievement not found',
  })

  /**
   * async findOne(@Param('id') id)
   *
   * @Param('id') decorator:
   * → Extract path parameter từ URL
   * → VD: /achievements/5 → id = 5
   * → NestJS tự động convert string "5" → number 5
   *
   * ⚠️ AUTHENTICATION REQUIRED
   * → User phải login (có JWT token)
   */
  async findOne(@Param('id') id: number): Promise<Achievement> {
    return this.achievementService.findOne(id);
  }

  // ============================================
  // UPDATE ENDPOINTS (3 types)
  // ============================================

  /**
   * UPDATE EVENT COUNT ACHIEVEMENT
   * ────────────────────────────────────────────
   * PUT /api/v1/achievements/event-count/:id
   *
   * Cập nhật achievement kiểu EVENT_COUNT
   *
   * @param id - Achievement ID
   * @param data - UpdateEventCountAchievementDto (partial fields)
   * @returns Success response
   *
   * Authentication: Required
   * Authorization: ADMIN only
   *
   * Request example (partial update):
   * PUT /api/v1/achievements/event-count/5
   * {
   *   "targetCount": 100,
   *   "description": "Updated description"
   * }
   *
   * → Chỉ update 2 fields này, giữ nguyên các fields khác
   */
  @Put('event-count/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Achievement ID',
  })
  @ApiOperation({
    summary: 'Update EVENT_COUNT achievement',
    description:
      'Update an existing EVENT_COUNT achievement (partial update supported)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Achievement not found',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async updateEventCount(
    @Param('id') id: number,
    @Body() data: UpdateEventCountAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    return this.achievementService.updateEventCount(id, data);
  }

  /**
   * UPDATE STREAK ACHIEVEMENT
   * ────────────────────────────────────────────
   * PUT /api/v1/achievements/streak/:id
   */
  @Put('streak/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Update STREAK achievement',
    description: 'Update an existing STREAK achievement',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement updated successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async updateStreak(
    @Param('id') id: number,
    @Body() data: UpdateStreakAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    return this.achievementService.updateStreak(id, data);
  }

  /**
   * UPDATE PROPERTY CHECK ACHIEVEMENT
   * ────────────────────────────────────────────
   * PUT /api/v1/achievements/property-check/:id
   */
  @Put('property-check/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Update PROPERTY_CHECK achievement',
    description: 'Update an existing PROPERTY_CHECK achievement',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement updated successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async updatePropertyCheck(
    @Param('id') id: number,
    @Body() data: UpdatePropertyCheckAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    return this.achievementService.updatePropertyCheck(id, data);
  }

  // ============================================
  // DELETE ENDPOINT
  // ============================================

  /**
   * DELETE ACHIEVEMENT
   * ────────────────────────────────────────────
   * DELETE /api/v1/achievements/:id
   *
   * Xóa achievement (HARD DELETE)
   *
   * @param id - Achievement ID
   * @returns Success response
   *
   * Authentication: Required
   * Authorization: ADMIN only
   *
   * Side effects (CASCADE DELETE):
   * - Xóa tất cả achievement_progresses liên quan
   * - Xóa tất cả learner_achievements liên quan
   *
   * WARNING: Đây là HARD DELETE, không thể khôi phục!
   * Nếu muốn tạm ẩn achievement → dùng DEACTIVATE thay vì DELETE
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Delete achievement',
    description:
      'Permanently delete an achievement (CASCADE: also deletes progress and earned records)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Achievement not found',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async delete(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.achievementService.delete(id);
  }

  // ============================================
  // ACTIVATE / DEACTIVATE ENDPOINTS
  // ============================================

  /**
   * ACTIVATE ACHIEVEMENT
   * ────────────────────────────────────────────
   * PATCH /api/v1/achievements/:id/activate
   *
   * Bật achievement (isActive = true)
   * → Achievement sẽ được track khi user làm gì đó
   *
   * @param id - Achievement ID
   * @returns Success response
   *
   * Authentication: Required
   * Authorization: ADMIN only
   *
   * Use case: Bật lại achievement đã bị deactivate
   */
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Activate achievement',
    description: 'Enable achievement tracking (set isActive = true)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement activated successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async activate(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.achievementService.activate(id);
  }

  /**
   * DEACTIVATE ACHIEVEMENT
   * ────────────────────────────────────────────
   * PATCH /api/v1/achievements/:id/deactivate
   *
   * Tắt achievement (isActive = false)
   * → Achievement sẽ KHÔNG được track
   * → Data cũ (progress, earned) vẫn giữ nguyên
   *
   * @param id - Achievement ID
   * @returns Success response
   *
   * Authentication: Required
   * Authorization: ADMIN only
   *
   * Use case:
   * - Tạm dừng track achievement nhưng không xóa data
   * - Achievement có thời hạn (VD: "Summer Event")
   * - Achievement đang test, chưa muốn public
   */
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Deactivate achievement',
    description:
      'Disable achievement tracking (set isActive = false, but keep existing data)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement deactivated successfully',
  })
  @CheckRoles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async deactivate(@Param('id') id: number): Promise<CustomApiResponse<void>> {
    return this.achievementService.deactivate(id);
  }

  // =====================================================================================================================
  // SPECIFIC ACHIEVEMENT PROGRESS ENDPOINT (with :id parameter)
  // =====================================================================================================================

  @Get(':id/my-progress')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my progress for a specific achievement',
    description:
      'Get progress details for a specific achievement of the current user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Achievement ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Achievement progress retrieved successfully',
    type: UserAchievementProgressDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Achievement not found',
  })
  @UseGuards(AuthGuard)
  async getMyProgressByAchievementId(
    @Param('id') id: number,
  ): Promise<UserAchievementProgressDto> {
    return this.achievementService.getMyProgressByAchievementId(id);
  }

  @Get('users/:userId/progress')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get achievement progress for a specific user',
    description: 'Admin/Coach can view achievement progress of any user',
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User achievement progress retrieved successfully',
    type: PaginatedUserAchievementProgress,
  })
  @CheckRoles(UserRole.ADMIN, UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getUserProgress(
    @Param('userId') userId: number,
    @Query('page') page: number = AchievementController.DEFAULT_PAGE,
    @Query('pageSize')
    pageSize: number = AchievementController.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedUserAchievementProgress> {
    const validatedPageSize = Math.min(
      pageSize,
      AchievementController.MAX_PAGE_SIZE,
    );
    const findOptions: FindOptions = {
      pagination: {
        page: page,
        size: validatedPageSize,
        offset: (page - 1) * validatedPageSize,
      } as Pagination,
    };
    return this.achievementService.getUserProgress(userId, findOptions);
  }

  @Get('users/:userId/earned')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get earned achievements for a specific user',
    description: 'Admin/Coach can view earned achievements of any user',
  })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User earned achievements retrieved successfully',
    type: PaginatedEarnedAchievement,
  })
  @CheckRoles(UserRole.ADMIN, UserRole.COACH)
  @UseGuards(AuthGuard, RoleGuard)
  async getUserEarnedAchievements(
    @Param('userId') userId: number,
    @Query('page') page: number = AchievementController.DEFAULT_PAGE,
    @Query('pageSize')
    pageSize: number = AchievementController.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedEarnedAchievement> {
    const validatedPageSize = Math.min(
      pageSize,
      AchievementController.MAX_PAGE_SIZE,
    );
    const findOptions: FindOptions = {
      pagination: {
        page: page,
        size: validatedPageSize,
        offset: (page - 1) * validatedPageSize,
      } as Pagination,
    };
    return this.achievementService.getUserEarnedAchievements(
      userId,
      findOptions,
    );
  }
}
