import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Achievement } from '@app/database/entities/achievement.entity';
import { AchievementProgress } from '@app/database/entities/achievement-progress.entity';
import { LearnerAchievement } from '@app/database/entities/learner-achievement.entity';
import { AchievementTracking } from '@app/database/entities/achievement-tracking.entity';
import { EventCountAchievement } from '@app/database/entities/event-count-achievement.entity';
import { StreakAchievement } from '@app/database/entities/streak-achievement.entity';
import { PropertyCheckAchievement } from '@app/database/entities/property-check-achievement.entity';
import { LearnerProgress } from '@app/database/entities/learner-progress.entity';
import { Coach } from '@app/database/entities/coach.entity';
import { User } from '@app/database/entities/user.entity';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACHIEVEMENT TRACKING SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Service này tự động lắng nghe các events từ hệ thống và track progress
 * của user với các achievements.
 *
 * VERSION 3: HOÀN CHỈNH - Hỗ trợ đủ cả 3 loại achievements:
 *
 * 1. EVENT_COUNT - Đếm số lần event
 *    VD: "Complete 50 quizzes", "Attend 100 sessions"
 *
 * 2. STREAK - Đếm chuỗi ngày liên tiếp
 *    VD: "Login 7 days in a row", "Do quiz daily for 14 days"
 *
 * 3. PROPERTY_CHECK - Kiểm tra điều kiện/thuộc tính
 *    VD: "avgQuizScore >= 80", "yearOfExperience >= 5"
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */
@Injectable()
export class AchievementTrackingService implements OnModuleInit {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,

    @InjectRepository(AchievementProgress)
    private readonly progressRepository: Repository<AchievementProgress>,

    @InjectRepository(LearnerAchievement)
    private readonly learnerAchievementRepository: Repository<LearnerAchievement>,

    @InjectRepository(AchievementTracking)
    private readonly trackingRepository: Repository<AchievementTracking>,

    @InjectRepository(LearnerProgress)
    private readonly learnerProgressRepository: Repository<LearnerProgress>,

    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * ON MODULE INIT
   * ═══════════════════════════════════════════════════════════════════════════════
   * Method này tự động chạy khi NestJS app start
   * Dùng để đăng ký các event listeners
   */
  onModuleInit() {
    console.log('🎯 [Achievement Tracking] Service initialized');
    this.registerEventListeners();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * REGISTER EVENT LISTENERS
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Đăng ký lắng nghe các events từ hệ thống
   *
   * Flow:
   * 1. SessionService emit event: 'quiz.completed'
   * 2. EventEmitter broadcast event đến tất cả listeners
   * 3. Method handleEvent() của service này tự động được gọi
   *
   * VERSION 3: Listen 3 events
   * - quiz.completed: EVENT_COUNT + STREAK + PROPERTY_CHECK
   * - session.attended: EVENT_COUNT + STREAK
   * - user.login: EVENT_COUNT + STREAK
   */
  private registerEventListeners() {
    console.log('🎧 [Achievement Tracking] Registering event listeners...');

    // Listen event: quiz.completed (EVENT_COUNT)
    this.eventEmitter.on('quiz.completed', (payload) => {
      console.log(
        '📨 [Achievement Tracking] Received event: quiz.completed',
        payload,
      );
      this.handleEvent('QUIZ_COMPLETED', payload);
    });

    // Listen event: session.attended (EVENT_COUNT)
    this.eventEmitter.on('session.attended', (payload) => {
      console.log(
        '📨 [Achievement Tracking] Received event: session.attended',
        payload,
      );
      this.handleEvent('SESSION_ATTENDED', payload);
    });

    // Listen event: user.login (STREAK)
    this.eventEmitter.on('user.login', (payload) => {
      console.log(
        '📨 [Achievement Tracking] Received event: user.login',
        payload,
      );
      this.handleEvent('DAILY_LOGIN', payload);
    });

    console.log('✅ [Achievement Tracking] Event listeners registered');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * HANDLE EVENT (Main Entry Point)
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Method này được gọi khi có event xảy ra
   *
   * @param eventName - Tên event (VD: QUIZ_COMPLETED)
   * @param payload - Data của event { userId, ... }
   *
   * Flow:
   * 1. Nhận event từ EventEmitter
   * 2. Tìm tất cả achievements có eventName khớp
   * 3. Xử lý từng achievement
   */
  async handleEvent(eventName: string, payload: any): Promise<void> {
    try {
      const { userId } = payload;

      if (!userId) {
        console.error('❌ [Achievement Tracking] Missing userId in payload');
        return;
      }

      console.log(
        `🔍 [Achievement Tracking] Finding achievements for event: ${eventName}`,
      );

      // Tìm tất cả achievements liên quan đến event này
      const achievements = await this.findAchievementsByEvent(eventName);

      if (achievements.length === 0) {
        console.log(
          `ℹ️ [Achievement Tracking] No achievements found for event: ${eventName}`,
        );
        return;
      }

      console.log(
        `✅ [Achievement Tracking] Found ${achievements.length} achievement(s) for event: ${eventName}`,
      );

      // Xử lý từng achievement
      for (const achievement of achievements) {
        await this.processAchievement(userId, achievement, payload);
      }
    } catch (error) {
      console.error('❌ [Achievement Tracking] Error handling event:', error);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * FIND ACHIEVEMENTS BY EVENT
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Tìm tất cả achievements có eventName khớp và đang active
   *
   * VERSION 3: Hỗ trợ CẢ 3 LOẠI
   *
   * @param eventName - Tên event cần tìm
   * @returns Array of achievements (EVENT_COUNT + STREAK + PROPERTY_CHECK)
   *
   * Query example:
   * SELECT * FROM achievements
   * WHERE event_name = 'QUIZ_COMPLETED'
   * AND is_active = true
   * AND type IN ('EVENT_COUNT', 'STREAK', 'PROPERTY_CHECK')
   */
  private async findAchievementsByEvent(
    eventName: string,
  ): Promise<
    (EventCountAchievement | StreakAchievement | PropertyCheckAchievement)[]
  > {
    // Tìm CẢ 3 loại achievements
    const achievements = await this.achievementRepository
      .createQueryBuilder('achievement')
      .where('achievement.type IN (:...types)', {
        types: ['EVENT_COUNT', 'STREAK', 'PROPERTY_CHECK'],
      })
      .andWhere('achievement.isActive = :isActive', { isActive: true })
      .andWhere('achievement.eventName = :eventName', { eventName })
      .getMany();

    return achievements as (
      | EventCountAchievement
      | StreakAchievement
      | PropertyCheckAchievement
    )[];
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * PROCESS ACHIEVEMENT
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Xử lý 1 achievement cụ thể cho user
   *
   * VERSION 3: Hỗ trợ CẢ 3 LOẠI
   *
   * @param userId - ID của user
   * @param achievement - Achievement cần xử lý
   * @param payload - Data từ event
   *
   * Flow:
   * 1. Check user đã earn achievement này chưa
   * 2. Nếu chưa → Xử lý theo type (EVENT_COUNT, STREAK, hoặc PROPERTY_CHECK)
   */
  private async processAchievement(
    userId: number,
    achievement:
      | EventCountAchievement
      | StreakAchievement
      | PropertyCheckAchievement,
    payload: any,
  ): Promise<void> {
    try {
      // Determine type by checking specific properties
      const isEventCount = 'targetCount' in achievement;
      const isStreak = 'targetStreakLength' in achievement;
      const isPropertyCheck = 'propertyName' in achievement;
      const achievementType = isEventCount
        ? 'EVENT_COUNT'
        : isStreak
          ? 'STREAK'
          : isPropertyCheck
            ? 'PROPERTY_CHECK'
            : 'UNKNOWN';

      console.log(
        `🎯 [Achievement Tracking] Processing ${achievementType} achievement: ${achievement.name} (ID: ${achievement.id})`,
      );

      // Check user đã đạt achievement này chưa
      const alreadyEarned = await this.learnerAchievementRepository.findOne({
        where: {
          user: { id: userId },
          achievement: { id: achievement.id },
        },
      });

      if (alreadyEarned) {
        console.log(
          `ℹ️ [Achievement Tracking] User ${userId} already earned: ${achievement.name}`,
        );
        return;
      }

      // Xử lý theo type
      if ('targetCount' in achievement) {
        await this.processEventCount(
          userId,
          achievement as EventCountAchievement,
        );
      } else if ('targetStreakLength' in achievement) {
        await this.processStreak(userId, achievement as StreakAchievement);
      } else if ('propertyName' in achievement) {
        await this.processPropertyCheck(
          userId,
          achievement as PropertyCheckAchievement,
          payload,
        );
      }
    } catch (error) {
      console.error(
        `❌ [Achievement Tracking] Error processing achievement ${achievement.name}:`,
        error,
      );
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * PROCESS EVENT_COUNT ACHIEVEMENT
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Xử lý achievement kiểu đếm số lần
   *
   * @param userId - ID user
   * @param achievement - EVENT_COUNT achievement
   *
   * Flow:
   * 1. Tìm hoặc tạo tracking record
   * 2. Tăng eventCount lên 1
   * 3. Tính progress (%)
   * 4. Update progress record
   * 5. Nếu đạt 100% → Award achievement
   *
   * Example:
   * - Achievement: "Complete 50 quizzes"
   * - User làm quiz lần 1 → eventCount: 0 → 1 (progress: 2%)
   * - User làm quiz lần 2 → eventCount: 1 → 2 (progress: 4%)
   * - ...
   * - User làm quiz lần 50 → eventCount: 49 → 50 (progress: 100%) → AWARD!
   */
  private async processEventCount(
    userId: number,
    achievement: EventCountAchievement,
  ): Promise<void> {
    try {
      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 1: Tìm hoặc tạo tracking record
      // ═══════════════════════════════════════════════════════════════════════════════
      let tracking = await this.trackingRepository.findOne({
        where: {
          userId,
          achievementId: achievement.id,
        },
      });

      if (!tracking) {
        // Lần đầu tiên làm event này → Tạo record mới
        console.log(
          `📝 [Achievement Tracking] Creating new tracking record for user ${userId}`,
        );

        tracking = this.trackingRepository.create({
          userId,
          achievementId: achievement.id,
          eventName: achievement.eventName,
          eventCount: 0,
          lastEventAt: new Date(),
        });
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 2: Tăng eventCount
      // ═══════════════════════════════════════════════════════════════════════════════
      tracking.eventCount += 1;
      tracking.lastEventAt = new Date();
      await this.trackingRepository.save(tracking);

      console.log(
        `📊 [Achievement Tracking] User ${userId}: ${achievement.name} - ` +
          `${tracking.eventCount}/${achievement.targetCount}`,
      );

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 3: Tính progress (%)
      // ═══════════════════════════════════════════════════════════════════════════════
      const progress = Math.min(
        Math.round((tracking.eventCount / achievement.targetCount) * 100),
        100,
      );

      console.log(`📈 [Achievement Tracking] Progress: ${progress}%`);

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 4: Update progress record
      // ═══════════════════════════════════════════════════════════════════════════════
      await this.updateProgress(userId, achievement.id, progress);

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 5: Award achievement nếu đạt 100%
      // ═══════════════════════════════════════════════════════════════════════════════
      if (progress === 100) {
        await this.awardAchievement(userId, achievement);
      }
    } catch (error) {
      console.error(
        '❌ [Achievement Tracking] Error processing event count:',
        error,
      );
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * PROCESS STREAK ACHIEVEMENT
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Xử lý achievement kiểu chuỗi liên tiếp
   *
   * @param userId - ID user
   * @param achievement - STREAK achievement
   *
   * Flow:
   * 1. Lấy tracking record
   * 2. Check xem có phải ngày liên tiếp không
   * 3. Nếu liên tiếp → Tăng streak, không liên tiếp → Reset về 1
   * 4. Tính progress
   * 5. Update progress
   * 6. Award nếu đạt target
   *
   * Example:
   * - Achievement: "Login 7 days streak"
   * - Day 1: Login → streak = 1/7 (14%)
   * - Day 2: Login → streak = 2/7 (28%)
   * - Day 3: KHÔNG login
   * - Day 4: Login → streak = 1/7 (14%) [RESET]
   * - ...
   * - Day 10: Login → streak = 7/7 (100%) [AWARD]
   */
  private async processStreak(
    userId: number,
    achievement: StreakAchievement,
  ): Promise<void> {
    try {
      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 1: Lấy tracking record
      // ═══════════════════════════════════════════════════════════════════════════════
      let tracking = await this.trackingRepository.findOne({
        where: {
          userId,
          achievementId: achievement.id,
        },
      });

      const now = new Date();
      let currentStreak = 0;

      if (!tracking) {
        // ═══════════════════════════════════════════════════════════════════════════════
        // FIRST TIME - Tạo streak đầu tiên
        // ═══════════════════════════════════════════════════════════════════════════════
        console.log(
          `📝 [Achievement Tracking] Creating new streak record for user ${userId}`,
        );

        currentStreak = 1;
        tracking = this.trackingRepository.create({
          userId,
          achievementId: achievement.id,
          eventName: achievement.eventName,
          eventCount: 1,
          lastEventAt: now,
          metadata: {
            currentStreak: 1,
            maxStreak: 1,
            startDate: now.toISOString(),
          },
        });

        await this.trackingRepository.save(tracking);
      } else {
        // ═══════════════════════════════════════════════════════════════════════════════
        // STEP 2: Check xem có phải ngày liên tiếp không
        // ═══════════════════════════════════════════════════════════════════════════════
        const lastEventDate = new Date(tracking.lastEventAt);
        const daysDiff = this.getDaysDifference(lastEventDate, now);

        console.log(
          `📅 [Achievement Tracking] Last event: ${lastEventDate.toDateString()}, Today: ${now.toDateString()}, Days diff: ${daysDiff}`,
        );

        if (daysDiff === 0) {
          // ═══════════════════════════════════════════════════════════════════════════════
          // SAME DAY - Không làm gì (user đã login rồi hôm nay)
          // ═══════════════════════════════════════════════════════════════════════════════
          currentStreak = tracking.metadata?.currentStreak || 1;
          console.log(
            `ℹ️ [Achievement Tracking] Same day event, streak unchanged: ${currentStreak}`,
          );
          return; // Exit sớm, không update gì cả
        } else if (daysDiff === 1) {
          // ═══════════════════════════════════════════════════════════════════════════════
          // CONSECUTIVE DAY - Tăng streak
          // ═══════════════════════════════════════════════════════════════════════════════
          currentStreak = (tracking.metadata?.currentStreak || 0) + 1;
          console.log(
            `🔥 [Achievement Tracking] Consecutive day! Streak increased: ${currentStreak}`,
          );
        } else {
          // ═══════════════════════════════════════════════════════════════════════════════
          // BROKEN STREAK - Reset về 1
          // ═══════════════════════════════════════════════════════════════════════════════
          console.log(
            `💔 [Achievement Tracking] Streak broken! Days missed: ${daysDiff - 1}`,
          );
          currentStreak = 1;
        }

        // Update tracking
        tracking.eventCount = currentStreak;
        tracking.lastEventAt = now;
        tracking.metadata = {
          currentStreak,
          maxStreak: Math.max(currentStreak, tracking.metadata?.maxStreak || 0),
          startDate:
            daysDiff === 1 ? tracking.metadata?.startDate : now.toISOString(),
          lastBreakDate:
            daysDiff > 1 ? now.toISOString() : tracking.metadata?.lastBreakDate,
        };

        await this.trackingRepository.save(tracking);
      }

      console.log(
        `📊 [Achievement Tracking] User ${userId}: ${achievement.name} - ` +
          `Streak ${currentStreak}/${achievement.targetStreakLength}`,
      );

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 3: Tính progress (%)
      // ═══════════════════════════════════════════════════════════════════════════════
      const progress = Math.min(
        Math.round((currentStreak / achievement.targetStreakLength) * 100),
        100,
      );

      console.log(`📈 [Achievement Tracking] Streak progress: ${progress}%`);

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 4: Update progress record
      // ═══════════════════════════════════════════════════════════════════════════════
      await this.updateProgress(userId, achievement.id, progress);

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 5: Award achievement nếu đạt 100%
      // ═══════════════════════════════════════════════════════════════════════════════
      if (progress === 100) {
        await this.awardAchievement(userId, achievement);
      }
    } catch (error) {
      console.error(
        '❌ [Achievement Tracking] Error processing streak:',
        error,
      );
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * PROCESS PROPERTY_CHECK ACHIEVEMENT
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Xử lý achievement kiểu kiểm tra điều kiện/thuộc tính
   *
   * @param userId - ID user
   * @param achievement - PROPERTY_CHECK achievement
   * @param payload - Data từ event (có thể chứa property value)
   *
   * Flow:
   * 1. Lấy giá trị property (từ payload hoặc query DB)
   * 2. So sánh với target value theo operator
   * 3. Nếu đạt điều kiện → progress = 100%, award
   * 4. Nếu không đạt → progress = 0%
   *
   * Example:
   * - Achievement: "Quiz Pro" - avgQuizScore >= 80
   * - User avgQuizScore = 85
   * - Check: 85 >= 80 → TRUE → Award!
   *
   * - Achievement: "Perfect Score" - avgQuizScore == 100
   * - User avgQuizScore = 95
   * - Check: 95 == 100 → FALSE → No award
   */
  private async processPropertyCheck(
    userId: number,
    achievement: PropertyCheckAchievement,
    payload: any,
  ): Promise<void> {
    try {
      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 1: Lấy giá trị property
      // ═══════════════════════════════════════════════════════════════════════════════
      let propertyValue: any;

      // Try lấy từ payload trước (nếu event đã gửi kèm)
      if (payload && payload[achievement.propertyName] !== undefined) {
        propertyValue = payload[achievement.propertyName];
        console.log(
          `📊 [Achievement Tracking] Property value from payload: ${achievement.propertyName} = ${propertyValue}`,
        );
      } else {
        // Nếu không có trong payload, query từ DB
        propertyValue = await this.getPropertyValue(
          userId,
          achievement.entityName,
          achievement.propertyName,
        );
        console.log(
          `📊 [Achievement Tracking] Property value from DB: ${achievement.entityName}.${achievement.propertyName} = ${propertyValue}`,
        );
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 2: Kiểm tra điều kiện
      // ═══════════════════════════════════════════════════════════════════════════════
      const conditionMet = this.evaluateCondition(
        propertyValue,
        achievement.comparisonOperator,
        achievement.targetValue,
      );

      console.log(
        `🔍 [Achievement Tracking] Condition: ${propertyValue} ${achievement.comparisonOperator} ${achievement.targetValue} = ${conditionMet ? 'MET ✅' : 'NOT MET ❌'}`,
      );

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 3: Update progress
      // ═══════════════════════════════════════════════════════════════════════════════
      const progress = conditionMet ? 100 : 0;
      await this.updateProgress(userId, achievement.id, progress);

      console.log(`📈 [Achievement Tracking] Progress: ${progress}%`);

      // ═══════════════════════════════════════════════════════════════════════════════
      // STEP 4: Award achievement nếu đạt điều kiện
      // ═══════════════════════════════════════════════════════════════════════════════
      if (conditionMet) {
        await this.awardAchievement(userId, achievement);
      }
    } catch (error) {
      console.error(
        '❌ [Achievement Tracking] Error processing property check:',
        error,
      );
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * GET PROPERTY VALUE
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Lấy giá trị property từ database
   *
   * @param userId - ID user
   * @param entityName - Tên entity (VD: LearnerProgress, Coach, User)
   * @param propertyName - Tên property (VD: avgQuizScore, yearOfExperience)
   * @returns Giá trị property
   *
   * Supported entities:
   * - LearnerProgress: avgQuizScore, avgAiAnalysisScore, sessionsCompleted
   * - Coach: yearOfExperience, verificationStatus
   * - User: (có thể thêm sau)
   */
  private async getPropertyValue(
    userId: number,
    entityName: string,
    propertyName: string,
  ): Promise<any> {
    try {
      switch (entityName) {
        case 'LearnerProgress': {
          // Query learner progress (lấy record mới nhất)
          const learnerProgress = await this.learnerProgressRepository.findOne({
            where: { user: { id: userId } },
            order: { updatedAt: 'DESC' },
          });

          if (!learnerProgress) {
            console.warn(
              `⚠️ [Achievement Tracking] No LearnerProgress found for user ${userId}`,
            );
            return 0;
          }

          return learnerProgress[propertyName] ?? 0;
        }

        case 'Coach': {
          const coach = await this.coachRepository.findOne({
            where: { user: { id: userId } },
          });

          if (!coach) {
            console.warn(
              `⚠️ [Achievement Tracking] No Coach found for user ${userId}`,
            );
            return null;
          }

          return coach[propertyName];
        }

        case 'User': {
          const user = await this.userRepository.findOne({
            where: { id: userId },
          });

          if (!user) {
            console.warn(`⚠️ [Achievement Tracking] User ${userId} not found`);
            return null;
          }

          return user[propertyName];
        }

        default:
          console.warn(
            `⚠️ [Achievement Tracking] Unknown entity: ${entityName}`,
          );
          return null;
      }
    } catch (error) {
      console.error(
        `❌ [Achievement Tracking] Error getting property value:`,
        error,
      );
      return null;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * EVALUATE CONDITION
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Kiểm tra điều kiện so sánh
   *
   * @param value - Giá trị thực tế
   * @param operator - Toán tử (==, !=, >, <, >=, <=)
   * @param target - Giá trị mục tiêu
   * @returns true nếu điều kiện đúng, false nếu sai
   *
   * Examples:
   * - evaluateCondition(85, '>=', '80') → true
   * - evaluateCondition(75, '>=', '80') → false
   * - evaluateCondition(100, '==', '100') → true
   */
  private evaluateCondition(
    value: any,
    operator: string,
    target: string,
  ): boolean {
    // Try parse as number
    const numValue = parseFloat(value);
    const numTarget = parseFloat(target);

    // If both are valid numbers, compare as numbers
    if (!isNaN(numValue) && !isNaN(numTarget)) {
      switch (operator) {
        case '==':
          return numValue === numTarget;
        case '!=':
          return numValue !== numTarget;
        case '>':
          return numValue > numTarget;
        case '<':
          return numValue < numTarget;
        case '>=':
          return numValue >= numTarget;
        case '<=':
          return numValue <= numTarget;
        default:
          console.warn(
            `⚠️ [Achievement Tracking] Unknown operator: ${operator}`,
          );
          return false;
      }
    }

    // If not numbers, compare as strings
    switch (operator) {
      case '==':
        return value.toString() === target;
      case '!=':
        return value.toString() !== target;
      default:
        console.warn(
          `⚠️ [Achievement Tracking] Operator ${operator} not supported for strings`,
        );
        return false;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * GET DAYS DIFFERENCE
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Tính số ngày chênh lệch giữa 2 dates (chỉ tính phần ngày, bỏ qua giờ)
   *
   * @param date1 - Ngày 1
   * @param date2 - Ngày 2
   * @returns Số ngày chênh lệch
   *
   * Example:
   * - date1: 2025-11-16 23:59:00
   * - date2: 2025-11-17 00:01:00
   * - Result: 1 (ngày liên tiếp)
   *
   * - date1: 2025-11-16 10:00:00
   * - date2: 2025-11-16 20:00:00
   * - Result: 0 (cùng ngày)
   *
   * - date1: 2025-11-16
   * - date2: 2025-11-19
   * - Result: 3 (cách 3 ngày)
   */
  private getDaysDifference(date1: Date, date2: Date): number {
    // Normalize về đầu ngày (00:00:00) để chỉ so sánh ngày
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

    // Tính diff bằng milliseconds, convert sang ngày
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * UPDATE PROGRESS
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Update progress của user với achievement
   *
   * @param userId - ID user
   * @param achievementId - ID achievement
   * @param progress - Progress (0-100)
   *
   * Table: achievement_progress
   * - Lưu progress của user với từng achievement
   * - Dùng để hiển thị UI progress bar
   */
  private async updateProgress(
    userId: number,
    achievementId: number,
    progress: number,
  ): Promise<void> {
    let progressRecord = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
    });

    if (!progressRecord) {
      // Tạo record mới
      progressRecord = this.progressRepository.create({
        user: { id: userId },
        achievement: { id: achievementId },
        currentProgress: progress,
      });
    } else {
      // Update progress
      progressRecord.currentProgress = progress;
    }

    await this.progressRepository.save(progressRecord);
    console.log(`💾 [Achievement Tracking] Progress saved: ${progress}%`);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * AWARD ACHIEVEMENT
   * ═══════════════════════════════════════════════════════════════════════════════
   *
   * Trao achievement cho user khi đạt 100%
   *
   * @param userId - ID user
   * @param achievement - Achievement đã đạt
   *
   * Flow:
   * 1. Double check user chưa có achievement
   * 2. Tạo learner_achievement record
   * 3. Emit event 'achievement.earned' cho notification service
   */
  private async awardAchievement(
    userId: number,
    achievement: Achievement,
  ): Promise<void> {
    try {
      // Double check để tránh duplicate
      const exists = await this.learnerAchievementRepository.findOne({
        where: {
          user: { id: userId },
          achievement: { id: achievement.id },
        },
      });

      if (exists) {
        return;
      }

      // Tạo earned achievement record
      const earned = this.learnerAchievementRepository.create({
        user: { id: userId },
        achievement: { id: achievement.id },
        earnedAt: new Date(),
      });

      await this.learnerAchievementRepository.save(earned);

      console.log(
        `🎉🎉🎉 [Achievement Tracking] User ${userId} EARNED: ${achievement.name}! 🎉🎉🎉`,
      );

      // Emit event để WebSocket gateway gửi notification
      this.eventEmitter.emit('achievement.earned', {
        userId,
        achievementId: achievement.id,
        achievementName: achievement.name,
        achievementIcon: achievement.iconUrl,
      });

      console.log(
        `📢 [Achievement Tracking] Event 'achievement.earned' emitted`,
      );
    } catch (error) {
      console.error(
        '❌ [Achievement Tracking] Error awarding achievement:',
        error,
      );
    }
  }
}
