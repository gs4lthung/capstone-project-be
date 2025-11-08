import { Injectable, Scope, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { CustomRpcException } from '@app/shared/customs/custom-rpc-exception';
import { ExceptionUtils } from '@app/shared/utils/exception.util';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { AwsService } from '@app/aws';

// Import Entities
import { Achievement } from '@app/database/entities/achievement.entity';
import { EventCountAchievement } from '@app/database/entities/event-count-achievement.entity';
import { StreakAchievement } from '@app/database/entities/streak-achievement.entity';
import { PropertyCheckAchievement } from '@app/database/entities/property-check-achievement.entity';
import { AchievementProgress } from '@app/database/entities/achievement-progress.entity';
import { LearnerAchievement } from '@app/database/entities/learner-achievement.entity';
import { User } from '@app/database/entities/user.entity';

// Import DTOs & Enums
import {
  CreateEventCountAchievementDto,
  CreateStreakAchievementDto,
  CreatePropertyCheckAchievementDto,
  UpdateEventCountAchievementDto,
  UpdateStreakAchievementDto,
  UpdatePropertyCheckAchievementDto,
} from '@app/shared/dtos/achievements/achievement.dto';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';

/**
 * ============================================
 * ACHIEVEMENT SERVICE
 * ============================================
 * Service này quản lý TẤT CẢ business logic liên quan đến Achievement
 *
 * @Injectable({ scope: Scope.REQUEST })
 * → Mỗi HTTP request tạo 1 instance mới của service này
 * → Cho phép inject REQUEST để lấy thông tin user hiện tại
 *
 * extends BaseTypeOrmService<Achievement>
 * → Kế thừa các method CRUD cơ bản: find(), findOne(), update(), delete()
 * → Không cần viết lại code pagination, filtering, sorting
 */
@Injectable({ scope: Scope.REQUEST })
export class AchievementService extends BaseTypeOrmService<Achievement> {
  constructor(
    /**
     * @Inject(REQUEST)
     * Inject HTTP request object để lấy thông tin user từ JWT token
     * VD: this.request.user → { id: 5, role: 'ADMIN' }
     */
    @Inject(REQUEST) private readonly request: CustomApiRequest,

    /**
     * @InjectRepository()
     * Inject TypeORM repositories để tương tác với database
     *
     * Lưu ý: Achievement dùng Single Table Inheritance
     * → 1 repository nhưng có thể query theo type
     */
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,

    @InjectRepository(EventCountAchievement)
    private readonly eventCountRepository: Repository<EventCountAchievement>,

    @InjectRepository(StreakAchievement)
    private readonly streakRepository: Repository<StreakAchievement>,

    @InjectRepository(PropertyCheckAchievement)
    private readonly propertyCheckRepository: Repository<PropertyCheckAchievement>,

    @InjectRepository(AchievementProgress)
    private readonly achievementProgressRepository: Repository<AchievementProgress>,

    @InjectRepository(LearnerAchievement)
    private readonly learnerAchievementRepository: Repository<LearnerAchievement>,

    /**
     * AwsService
     * → Service để upload files lên AWS S3
     * → Dùng cho upload icon của achievement
     */
    private readonly awsService: AwsService,
  ) {
    /**
     * super(achievementRepository)
     * → Truyền repository vào BaseTypeOrmService
     * → Kích hoạt các method: find(), findOne() từ base class
     */
    super(achievementRepository);
  }

  // ============================================
  // CREATE METHODS (3 types)
  // ============================================

  /**
   * TEST AWS CONNECTION
   * ─────────────────────────────────────
   */
  async testAws(): Promise<any> {
    console.log('🔷 [TEST] Starting AWS connection test...');
    const result = await this.awsService.testConnection();
    console.log('🔷 [TEST] Result:', result);
    return result;
  }

  /**
   * CREATE EVENT COUNT ACHIEVEMENT
   * ─────────────────────────────────────
   * Tạo achievement kiểu "đếm số lần sự kiện"
   * VD: "Hoàn thành 50 bài học", "Tham gia 10 buổi học"
   *
   * @param data - DTO chứa thông tin achievement
   * @param icon - File icon (optional) - sẽ upload lên S3
   * @returns CustomApiResponse với status 201 CREATED
   *
   * Flow:
   * 1. Upload icon lên S3 (nếu có)
   * 2. Tạo entity mới từ DTO + iconUrl từ S3
   * 3. Gán createdBy = user hiện tại (từ JWT)
   * 4. Save vào database
   * 5. Trả về response thành công
   */
  async createEventCount(
    data: CreateEventCountAchievementDto,
    icon?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    console.log('🔷 [CREATE EVENT COUNT] Start');
    console.log('🔷 Data:', JSON.stringify(data, null, 2));
    console.log('🔷 Icon file:', icon ? { 
      filename: icon.filename, 
      originalname: icon.originalname, 
      mimetype: icon.mimetype, 
      size: icon.size,
      path: icon.path 
    } : 'No icon');

    // Upload icon lên S3 nếu có file
    let iconUrl: string | undefined = undefined;
    if (icon) {
      try {
        console.log('🔷 [AWS] Starting upload to S3...');
        const uploadPromise = this.awsService.uploadFileToPublicBucket({
          file: {
            buffer: icon.buffer,
            ...icon,
          },
        });
        
        // Timeout sau 60 giây (để xem error message chi tiết từ AWS)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('AWS S3 upload timeout after 60s')), 60000);
        });
        
        iconUrl = await Promise.race([uploadPromise, timeoutPromise])
          .then((res) => {
            console.log('🔷 [AWS] Upload success:', res.url);
            return res.url;
          });
      } catch (error) {
        console.error('🔷 [AWS] Upload failed:', error.message);
        console.warn('⚠️  [WARNING] Skipping icon upload, creating achievement without icon');
        // KHÔNG throw error, chỉ warning và tiếp tục
        // iconUrl sẽ là undefined
      }
    }

    console.log('🔷 [DB] Creating achievement entity...');
    // Tạo entity mới (chưa save DB)
    const achievement = this.eventCountRepository.create({
      ...data, // Spread all fields từ DTO
      iconUrl: iconUrl || data.iconUrl, // Ưu tiên iconUrl từ S3, fallback sang data.iconUrl
      createdBy: this.request.user as User, // Lấy user từ JWT token
      isActive: data.isActive ?? true, // Default true nếu không truyền
    });

    console.log('🔷 [DB] Saving achievement to database...');
    // Save vào database
    await this.eventCountRepository.save(achievement);

    console.log('🔷 [SUCCESS] Achievement created successfully');
    // Trả về response success
    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'ACHIEVEMENT.CREATE_SUCCESS',
    );
  }

  /**
   * CREATE STREAK ACHIEVEMENT
   * ─────────────────────────────────────
   * Tạo achievement kiểu "chuỗi liên tiếp"
   * VD: "Login 7 ngày liên tiếp", "Học 30 ngày liên tiếp"
   */
  async createStreak(
    data: CreateStreakAchievementDto,
    icon?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    // Upload icon lên S3 nếu có file
    let iconUrl: string | undefined = undefined;
    if (icon) {
      try {
        console.log('🔷 [AWS] Starting upload to S3 (Streak)...');
        const uploadPromise = this.awsService.uploadFileToPublicBucket({
          file: {
            buffer: icon.buffer,
            ...icon,
          },
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('AWS S3 upload timeout after 60s')), 60000);
        });
        
        iconUrl = await Promise.race([uploadPromise, timeoutPromise])
          .then((res) => {
            console.log('🔷 [AWS] Upload success:', res.url);
            return res.url;
          });
      } catch (error) {
        console.error('🔷 [AWS] Upload failed:', error.message);
        console.warn('⚠️  [WARNING] Skipping icon upload, creating achievement without icon');
      }
    }

    const achievement = this.streakRepository.create({
      ...data,
      iconUrl: iconUrl || data.iconUrl,
      createdBy: this.request.user as User,
      isActive: data.isActive ?? true,
    });

    await this.streakRepository.save(achievement);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'ACHIEVEMENT.CREATE_SUCCESS',
    );
  }

  /**
   * CREATE PROPERTY CHECK ACHIEVEMENT
   * ─────────────────────────────────────
   * Tạo achievement kiểu "kiểm tra điều kiện"
   * VD: "Điểm trung bình >= 80", "Rating >= 4.5"
   */
  async createPropertyCheck(
    data: CreatePropertyCheckAchievementDto,
    icon?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    // Validate comparison operator
    const validOperators = ['==', '!=', '>', '<', '>=', '<='];
    if (!validOperators.includes(data.comparisonOperator)) {
      throw new CustomRpcException(
        `Invalid comparison operator. Must be one of: ${validOperators.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Upload icon lên S3 nếu có file
    let iconUrl: string | undefined = undefined;
    if (icon) {
      try {
        console.log('🔷 [AWS] Starting upload to S3 (Property Check)...');
        const uploadPromise = this.awsService.uploadFileToPublicBucket({
          file: {
            buffer: icon.buffer,
            ...icon,
          },
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('AWS S3 upload timeout after 60s')), 60000);
        });
        
        iconUrl = await Promise.race([uploadPromise, timeoutPromise])
          .then((res) => {
            console.log('🔷 [AWS] Upload success:', res.url);
            return res.url;
          });
      } catch (error) {
        console.error('🔷 [AWS] Upload failed:', error.message);
        console.warn('⚠️  [WARNING] Skipping icon upload, creating achievement without icon');
      }
    }

    const achievement = this.propertyCheckRepository.create({
      ...data,
      iconUrl: iconUrl || data.iconUrl,
      createdBy: this.request.user as User,
      isActive: data.isActive ?? true,
    });

    await this.propertyCheckRepository.save(achievement);

    return new CustomApiResponse<void>(
      HttpStatus.CREATED,
      'ACHIEVEMENT.CREATE_SUCCESS',
    );
  }

  // ============================================
  // READ METHODS
  // ============================================

  /**
   * GET ALL ACHIEVEMENTS (with pagination, filter, sort)
   * ─────────────────────────────────────────────────────
   * Lấy danh sách achievements có phân trang, filter, sort
   *
   * @param findOptions - Object chứa: pagination, filter, sort
   * @returns PaginatedAchievement { items: [], total, page, pageSize }
   *
   * Ví dụ findOptions:
   * {
   *   pagination: { page: 1, size: 10, offset: 0 },
   *   filter: { property: 'isActive', value: true, rule: 'EQUALS' },
   *   sort: { property: 'createdAt', direction: 'DESC' }
   * }
   *
   * NOTE: Luôn sắp xếp theo createdAt DESC để đảm bảo thứ tự không thay đổi
   * khi update/activate/deactivate achievement
   */
  async findAll(
    findOptions: FindOptions,
  ): Promise<PaginateObject<Achievement>> {
    // Override sort option để luôn sắp xếp theo created_at DESC
    // Đảm bảo thứ tự không thay đổi khi update/activate/deactivate achievement
    const modifiedOptions = {
      ...findOptions,
      sort: {
        property: 'created_at',
        direction: 'DESC' as const,
      },
    };
    
    return super.find(modifiedOptions, 'achievement', PaginateObject<Achievement>);
  }

  /**
   * GET ONE ACHIEVEMENT BY ID
   * ─────────────────────────────────────
   * Lấy chi tiết 1 achievement theo ID
   *
   * @param id - Achievement ID
   * @returns Achievement entity với đầy đủ thông tin
   * @throws CustomRpcException nếu không tìm thấy
   *
   * Relations được load:
   * - createdBy: User tạo achievement
   * - achievementProgresses: Tiến độ của users (nếu cần)
   */
  async findOne(id: number): Promise<Achievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id },
      relations: ['createdBy'], // Load thông tin user tạo achievement
      withDeleted: false, // Không lấy records đã bị soft delete
    });

    // Nếu không tìm thấy → throw error
    if (!achievement) {
      throw new CustomRpcException(
        'Achievement not found',
        HttpStatus.NOT_FOUND,
        `achievement:${id}`,
      );
    }

    return achievement;
  }

  // ============================================
  // UPDATE METHODS (3 types)
  // ============================================

  /**
   * UPDATE EVENT COUNT ACHIEVEMENT
   * ─────────────────────────────────────
   * Cập nhật achievement kiểu EVENT_COUNT
   *
   * @param id - Achievement ID
   * @param data - UpdateEventCountAchievementDto (partial fields)
   * @param icon - File icon (optional) - sẽ upload lên S3
   * @returns Success response
   *
   * Flow:
   * 1. Tìm achievement theo ID
   * 2. Upload icon mới lên S3 (nếu có)
   * 3. Update fields từ DTO + iconUrl mới
   * 4. Save vào DB
   *
   * NOTE: Chỉ update fields được truyền trong DTO
   * VD: { targetCount: 100 } → Chỉ update targetCount, giữ nguyên các field khác
   */
  async updateEventCount(
    id: number,
    data: UpdateEventCountAchievementDto,
    icon?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    // Tìm achievement
    const achievement = await this.eventCountRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!achievement) {
      throw new CustomRpcException(
        'Achievement not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Upload icon mới lên S3 nếu có file
    if (icon) {
      const iconUrl = await this.awsService
        .uploadFileToPublicBucket({
          file: {
            buffer: icon.buffer,
            ...icon,
          },
        })
        .then((res) => res.url);
      
      data.iconUrl = iconUrl; // Override iconUrl trong data
    }

    /**
     * Object.assign(target, source)
     * → Copy tất cả properties từ source vào target
     * → Chỉ update fields có trong data (partial update)
     */
    Object.assign(achievement, data);

    // Save changes
    await this.eventCountRepository.save(achievement);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'ACHIEVEMENT.UPDATE_SUCCESS',
    );
  }

  /**
   * UPDATE STREAK ACHIEVEMENT
   * ─────────────────────────────────────
   * Cập nhật achievement kiểu STREAK
   */
  async updateStreak(
    id: number,
    data: UpdateStreakAchievementDto,
    icon?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    const achievement = await this.streakRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!achievement) {
      throw new CustomRpcException(
        'Achievement not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Upload icon mới lên S3 nếu có file
    if (icon) {
      const iconUrl = await this.awsService
        .uploadFileToPublicBucket({
          file: {
            buffer: icon.buffer,
            ...icon,
          },
        })
        .then((res) => res.url);
      
      data.iconUrl = iconUrl;
    }

    Object.assign(achievement, data);
    await this.streakRepository.save(achievement);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'ACHIEVEMENT.UPDATE_SUCCESS',
    );
  }

  /**
   * UPDATE PROPERTY CHECK ACHIEVEMENT
   * ─────────────────────────────────────
   * Cập nhật achievement kiểu PROPERTY_CHECK
   */
  async updatePropertyCheck(
    id: number,
    data: UpdatePropertyCheckAchievementDto,
    icon?: Express.Multer.File,
  ): Promise<CustomApiResponse<void>> {
    // Validate comparison operator nếu có update
    if (data.comparisonOperator) {
      const validOperators = ['==', '!=', '>', '<', '>=', '<='];
      if (!validOperators.includes(data.comparisonOperator)) {
        throw new CustomRpcException(
          `Invalid comparison operator. Must be one of: ${validOperators.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const achievement = await this.propertyCheckRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!achievement) {
      throw new CustomRpcException(
        'Achievement not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Upload icon mới lên S3 nếu có file
    if (icon) {
      const iconUrl = await this.awsService
        .uploadFileToPublicBucket({
          file: {
            buffer: icon.buffer,
            ...icon,
          },
        })
        .then((res) => res.url);
      
      data.iconUrl = iconUrl;
    }

    Object.assign(achievement, data);
    await this.propertyCheckRepository.save(achievement);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'ACHIEVEMENT.UPDATE_SUCCESS',
    );
  }

  // ============================================
  // DELETE METHOD
  // ============================================

  /**
   * DELETE ACHIEVEMENT
   * ─────────────────────────────────────
   * Xóa achievement theo ID
   *
   * @param id - Achievement ID
   * @returns Success response
   *
   * Side effects (CASCADE DELETE):
   * - Xóa tất cả achievement_progresses liên quan
   * - Xóa tất cả learner_achievements liên quan
   *
   * NOTE: Đây là HARD DELETE, không phải soft delete
   * Nếu muốn soft delete → dùng isActive = false
   */
  async delete(id: number): Promise<CustomApiResponse<void>> {
    const achievement = await this.achievementRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!achievement) {
      throw new CustomRpcException(
        'Achievement not found',
        HttpStatus.NOT_FOUND,
      );
    }

    /**
     * MANUAL CASCADE DELETE
     * Vì foreign key constraint không có ON DELETE CASCADE,
     * phải xóa tất cả records liên quan trước
     */
    
    // 1. Xóa tất cả learner_achievements (achievements đã earned)
    await this.learnerAchievementRepository.delete({
      achievement: { id },
    });

    // 2. Xóa tất cả achievement_progresses (tiến độ của users)
    await this.achievementProgressRepository.delete({
      achievement: { id },
    });

    // 3. Cuối cùng mới xóa achievement
    await this.achievementRepository.delete(id);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'ACHIEVEMENT.DELETE_SUCCESS',
    );
  }

  // ============================================
  // ACTIVATE / DEACTIVATE METHODS
  // ============================================

  /**
   * ACTIVATE ACHIEVEMENT
   * ─────────────────────────────────────
   * Bật achievement (isActive = true)
   * → Achievement sẽ được track khi user làm gì đó
   */
  async activate(id: number): Promise<CustomApiResponse<void>> {
    try {
      const achievement = await this.findOne(id);

      achievement.isActive = true;
      await this.achievementRepository.save(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'ACHIEVEMENT.ACTIVATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * DEACTIVATE ACHIEVEMENT
   * ─────────────────────────────────────
   * Tắt achievement (isActive = false)
   * → Achievement sẽ KHÔNG được track
   * → Data cũ (progress, earned) vẫn giữ nguyên
   *
   * Use case: Tạm dừng track achievement nhưng không xóa data
   */
  async deactivate(id: number): Promise<CustomApiResponse<void>> {
    const achievement = await this.findOne(id);

    achievement.isActive = false;
    await this.achievementRepository.save(achievement);

    return new CustomApiResponse<void>(
      HttpStatus.OK,
      'ACHIEVEMENT.DEACTIVATE_SUCCESS',
    );
  }

  // =====================================================================================================================
  // USER ACHIEVEMENT PROGRESS METHODS (Phần 2)
  // =====================================================================================================================

  /**
   * Lấy tất cả progress của current user
   * Trả về danh sách achievements với tiến độ hiện tại
   */
  async getMyProgress(findOptions: FindOptions): Promise<any> {
    const userId = Number(this.request.user.id);
    return this.getUserProgress(userId, findOptions);
  }

  /**
   * Lấy progress của 1 achievement cụ thể của current user
   */
  async getMyProgressByAchievementId(achievementId: number): Promise<any> {
    const userId = Number(this.request.user.id);

    // Kiểm tra achievement có tồn tại không
    const achievement = await this.findOne(achievementId);

    // Tìm progress record
    const progress = await this.achievementProgressRepository.findOne({
      where: {
        achievement: { id: achievementId },
        user: { id: userId },
      },
      relations: ['achievement', 'achievement.createdBy'],
    });

    if (!progress) {
      // Nếu chưa có progress, return 0
      return {
        achievement: achievement,
        currentProgress: 0,
        updatedAt: new Date(),
        isEarned: false,
      };
    }

    // Kiểm tra đã earned chưa
    const earned = await this.learnerAchievementRepository.findOne({
      where: {
        achievement: { id: achievementId },
        user: { id: userId },
      },
    });

    return {
      achievement: progress.achievement,
      currentProgress: progress.currentProgress,
      updatedAt: progress.updatedAt,
      isEarned: !!earned,
    };
  }

  /**
   * Lấy progress của user khác (dành cho ADMIN/COACH)
   * @param userId - ID của user cần xem
   * @param findOptions - Pagination, filter, sort options
   */
  async getUserProgress(
    userId: number,
    findOptions: FindOptions,
  ): Promise<any> {
    const { page = 1, size = 10 } = findOptions.pagination || {};
    const skip = (page - 1) * size;

    // Lấy tất cả active achievements
    const [achievements, totalAchievements] =
      await this.achievementRepository.findAndCount({
        where: { isActive: true },
        relations: ['createdBy'],
        skip,
        take: size,
        order: { createdAt: 'DESC' },
      });

    // Lấy tất cả progress của user này
    const progresses = await this.achievementProgressRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
    });

    // Lấy tất cả earned achievements của user
    const earnedAchievements = await this.learnerAchievementRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
    });

    // Map progress và earned status
    const progressMap = new Map();
    progresses.forEach((p) => {
      progressMap.set(p.achievement.id, p);
    });

    const earnedMap = new Set();
    earnedAchievements.forEach((e) => {
      earnedMap.add(e.achievement.id);
    });

    // Kết hợp data
    const data = achievements.map((achievement) => {
      const progress = progressMap.get(achievement.id);
      return {
        achievement: achievement,
        currentProgress: progress ? progress.currentProgress : 0,
        updatedAt: progress ? progress.updatedAt : new Date(),
        isEarned: earnedMap.has(achievement.id),
      };
    });

    return {
      data,
      total: totalAchievements,
      page,
      pageSize: size,
      totalPages: Math.ceil(totalAchievements / size),
    };
  }

  // =====================================================================================================================
  // EARNED ACHIEVEMENTS METHODS (Phần 3)
  // =====================================================================================================================

  /**
   * Lấy tất cả achievements đã earned của current user
   */
  async getMyEarnedAchievements(findOptions: FindOptions): Promise<any> {
    const userId = Number(this.request.user.id);
    return this.getUserEarnedAchievements(userId, findOptions);
  }

  /**
   * Lấy tất cả achievements đã earned của user khác (dành cho ADMIN/COACH)
   * @param userId - ID của user cần xem
   * @param findOptions - Pagination, filter, sort options
   */
  async getUserEarnedAchievements(
    userId: number,
    findOptions: FindOptions,
  ): Promise<any> {
    const { page = 1, size = 10 } = findOptions.pagination || {};
    const skip = (page - 1) * size;

    // Query earned achievements với pagination
    const [earnedRecords, total] =
      await this.learnerAchievementRepository.findAndCount({
        where: { user: { id: userId } },
        relations: ['achievement', 'achievement.createdBy', 'user'],
        skip,
        take: size,
        order: { earnedAt: 'DESC' }, // Mới nhất trước
      });

    // Map sang DTO
    const data = earnedRecords.map((record) => ({
      id: record.id,
      achievement: record.achievement,
      earnedAt: record.earnedAt,
      userId: record.user.id,
      userFullName: record.user.fullName,
    }));

    return {
      data,
      total,
      page,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    };
  }

  // ============================================
  // PART 4: STATISTICS & LEADERBOARD
  // ============================================

  /**
   * Get general achievement statistics (Public)
   * @returns AchievementStatsDto
   */
  async getStats(): Promise<any> {
    try {
      // Đếm tổng số achievements
      const totalAchievements = await this.achievementRepository.count();

      // Đếm theo type sử dụng child repositories
      const totalEventCount = await this.eventCountRepository.count();
      const totalStreak = await this.streakRepository.count();
      const totalPropertyCheck = await this.propertyCheckRepository.count();

      // Đếm achievements đang active
      const activeAchievements = await this.achievementRepository.count({
        where: { isActive: true },
      });

      return {
        totalAchievements,
        totalEventCount,
        totalStreak,
        totalPropertyCheck,
        activeAchievements,
      };
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * Get current user's achievement statistics
   * @returns UserAchievementStatsDto
   */
  async getMyStats(): Promise<any> {
    try {
      const userId = Number(this.request.user.id);

      // Đếm tổng achievements đã earned
      const totalEarned = await this.learnerAchievementRepository.count({
        where: { user: { id: userId } },
      });

      // Đếm tổng achievements đang in progress (progress > 0 nhưng < 100)
      const progressRecords = await this.achievementProgressRepository.find({
        where: { user: { id: userId } },
      });

      const totalInProgress = progressRecords.filter(
        (p) => p.currentProgress > 0 && p.currentProgress < 100,
      ).length;

      // Tính completion rate
      const totalActiveAchievements = await this.achievementRepository.count({
        where: { isActive: true },
      });

      const completionRate =
        totalActiveAchievements > 0
          ? Math.round((totalEarned / totalActiveAchievements) * 100)
          : 0;

      // Lấy achievement được earned gần nhất
      const lastEarnedRecord = await this.learnerAchievementRepository.findOne({
        where: { user: { id: userId } },
        relations: ['achievement'],
        order: { earnedAt: 'DESC' },
      });

      const result: any = {
        totalEarned,
        totalInProgress,
        completionRate,
      };

      if (lastEarnedRecord) {
        result.lastEarned = {
          name: lastEarnedRecord.achievement.name,
          earnedAt: lastEarnedRecord.earnedAt,
        };
      }

      return result;
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * Get leaderboard - top users with most achievements
   * @param limit - Number of top users to return (default 10)
   * @returns LeaderboardResponseDto
   */
  async getLeaderboard(limit: number = 10): Promise<any> {
    try {
      // Check if table has any data first
      const hasData = await this.learnerAchievementRepository.count();

      if (hasData === 0) {
        // Return empty leaderboard if no achievements earned yet
        return {
          items: [],
          total: 0,
        };
      }

      // Query để lấy top users với số achievements nhiều nhất
      const leaderboardData = await this.learnerAchievementRepository
        .createQueryBuilder('learner_achievement')
        .select('user.id', 'user_id')
        .addSelect('user.full_name', 'full_name')
        .addSelect('user.profile_picture', 'profile_picture')
        .addSelect('COUNT(learner_achievement.id)', 'total_earned')
        .addSelect('MAX(learner_achievement.earned_at)', 'last_earned_at')
        .innerJoin('learner_achievement.user', 'user')
        .groupBy('user.id')
        .addGroupBy('user.full_name')
        .addGroupBy('user.profile_picture')
        .orderBy('total_earned', 'DESC')
        .addOrderBy('last_earned_at', 'DESC')
        .limit(limit)
        .getRawMany();

      // Đếm tổng số users có achievements
      const totalUsersWithAchievements = await this.learnerAchievementRepository
        .createQueryBuilder('learner_achievement')
        .select('COUNT(DISTINCT learner_achievement.user_id)', 'total')
        .getRawOne();

      // Map to DTO format với rank
      const items = leaderboardData.map((record, index) => ({
        rank: index + 1,
        user: {
          id: record.user_id,
          fullName: record.full_name,
          profilePicture: record.profile_picture,
        },
        totalEarned: parseInt(record.total_earned),
        lastEarnedAt: record.last_earned_at,
      }));

      return {
        items,
        total: parseInt(totalUsersWithAchievements.total || 0),
      };
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}
