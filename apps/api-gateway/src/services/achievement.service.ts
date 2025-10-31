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

// Import Entities
import { Achievement } from '@app/database/entities/achievement.entity';
import { EventCountAchievement } from '@app/database/entities/event-count-achievement.entity';
import { StreakAchievement } from '@app/database/entities/streak-achievement.entity';
import { PropertyCheckAchievement } from '@app/database/entities/property-check-achievement.entity';
import { User } from '@app/database/entities/user.entity';

// Import DTOs
import {
  CreateEventCountAchievementDto,
  CreateStreakAchievementDto,
  CreatePropertyCheckAchievementDto,
  UpdateEventCountAchievementDto,
  UpdateStreakAchievementDto,
  UpdatePropertyCheckAchievementDto,
  PaginatedAchievement,
} from '@app/shared/dtos/achievements/achievement.dto';

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
   * CREATE EVENT COUNT ACHIEVEMENT
   * ─────────────────────────────────────
   * Tạo achievement kiểu "đếm số lần sự kiện"
   * VD: "Hoàn thành 50 bài học", "Tham gia 10 buổi học"
   * 
   * @param data - DTO chứa thông tin achievement
   * @returns CustomApiResponse với status 201 CREATED
   * 
   * Flow:
   * 1. Tạo entity mới từ DTO
   * 2. Gán createdBy = user hiện tại (từ JWT)
   * 3. Save vào database
   * 4. Trả về response thành công
   */
  async createEventCount(
    data: CreateEventCountAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      // Tạo entity mới (chưa save DB)
      const achievement = this.eventCountRepository.create({
        ...data, // Spread all fields từ DTO
        createdBy: this.request.user as User, // Lấy user từ JWT token
        isActive: data.isActive ?? true, // Default true nếu không truyền
      });

      // Save vào database
      await this.eventCountRepository.save(achievement);

      // Trả về response success
      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'ACHIEVEMENT.CREATE_SUCCESS',
      );
    } catch (error) {
      /**
       * ExceptionUtils.wrapAsRpcException()
       * → Wrap error thành CustomRpcException
       * → ErrorLoggingFilter sẽ catch và log vào DB
       * → Trả về response error cho client
       */
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * CREATE STREAK ACHIEVEMENT
   * ─────────────────────────────────────
   * Tạo achievement kiểu "chuỗi liên tiếp"
   * VD: "Login 7 ngày liên tiếp", "Học 30 ngày liên tiếp"
   */
  async createStreak(
    data: CreateStreakAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      const achievement = this.streakRepository.create({
        ...data,
        createdBy: this.request.user as User,
        isActive: data.isActive ?? true,
      });

      await this.streakRepository.save(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'ACHIEVEMENT.CREATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * CREATE PROPERTY CHECK ACHIEVEMENT
   * ─────────────────────────────────────
   * Tạo achievement kiểu "kiểm tra điều kiện"
   * VD: "Điểm trung bình >= 80", "Rating >= 4.5"
   */
  async createPropertyCheck(
    data: CreatePropertyCheckAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    try {
      // Validate comparison operator
      const validOperators = ['==', '!=', '>', '<', '>=', '<='];
      if (!validOperators.includes(data.comparisonOperator)) {
        throw new CustomRpcException(
          `Invalid comparison operator. Must be one of: ${validOperators.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const achievement = this.propertyCheckRepository.create({
        ...data,
        createdBy: this.request.user as User,
        isActive: data.isActive ?? true,
      });

      await this.propertyCheckRepository.save(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.CREATED,
        'ACHIEVEMENT.CREATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
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
   * super.find() từ BaseTypeOrmService sẽ:
   * 1. Build query với WHERE, ORDER BY, LIMIT, OFFSET
   * 2. Execute query
   * 3. Count total records
   * 4. Return paginated result
   */
  async findAll(findOptions: FindOptions): Promise<PaginatedAchievement> {
    return super.find(findOptions, 'achievement', PaginatedAchievement);
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
    try {
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
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
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
   * @returns Success response
   * 
   * Flow:
   * 1. Tìm achievement theo ID
   * 2. Validate type === EVENT_COUNT
   * 3. Update fields từ DTO
   * 4. Save vào DB
   * 
   * NOTE: Chỉ update fields được truyền trong DTO
   * VD: { targetCount: 100 } → Chỉ update targetCount, giữ nguyên các field khác
   */
  async updateEventCount(
    id: number,
    data: UpdateEventCountAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    try {
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
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * UPDATE STREAK ACHIEVEMENT
   * ─────────────────────────────────────
   * Cập nhật achievement kiểu STREAK
   */
  async updateStreak(
    id: number,
    data: UpdateStreakAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    try {
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

      Object.assign(achievement, data);
      await this.streakRepository.save(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'ACHIEVEMENT.UPDATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }

  /**
   * UPDATE PROPERTY CHECK ACHIEVEMENT
   * ─────────────────────────────────────
   * Cập nhật achievement kiểu PROPERTY_CHECK
   */
  async updatePropertyCheck(
    id: number,
    data: UpdatePropertyCheckAchievementDto,
  ): Promise<CustomApiResponse<void>> {
    try {
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

      Object.assign(achievement, data);
      await this.propertyCheckRepository.save(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'ACHIEVEMENT.UPDATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
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
    try {
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
       * remove() vs delete():
       * - remove(): Load entity trước, trigger cascade, hooks
       * - delete(): Direct SQL DELETE, nhanh hơn nhưng không trigger hooks
       * 
       * Dùng remove() để CASCADE DELETE hoạt động đúng
       */
      await this.achievementRepository.remove(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'ACHIEVEMENT.DELETE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
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
    try {
      const achievement = await this.findOne(id);
      
      achievement.isActive = false;
      await this.achievementRepository.save(achievement);

      return new CustomApiResponse<void>(
        HttpStatus.OK,
        'ACHIEVEMENT.DEACTIVATE_SUCCESS',
      );
    } catch (error) {
      throw ExceptionUtils.wrapAsRpcException(error);
    }
  }
}

