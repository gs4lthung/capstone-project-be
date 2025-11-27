import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Achievement } from './achievement.entity';

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVEMENT TRACKING ENTITY
 * ═══════════════════════════════════════════════════════════════
 * Entity này dùng để track progress của user với từng achievement
 *
 * Chức năng:
 * - EVENT_COUNT: Đếm số lần event xảy ra (eventCount)
 * - STREAK: Lưu thông tin streak trong metadata
 * - PROPERTY_CHECK: Không cần track (chỉ check điều kiện)
 *
 * Example data:
 * {
 *   userId: 123,
 *   achievementId: 5,
 *   eventName: 'QUIZ_COMPLETED',
 *   eventCount: 15,
 *   lastEventAt: '2025-11-17 20:30:00',
 *   metadata: {
 *     currentStreak: 5,
 *     maxStreak: 12,
 *     startDate: '2025-11-13',
 *     brokenCount: 2
 *   }
 * }
 */
@Entity('achievement_tracking')
export class AchievementTracking {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Tên event được track
   * VD: QUIZ_COMPLETED, SESSION_ATTENDED, DAILY_LOGIN
   */
  @Column({ name: 'event_name', type: 'varchar', length: 100 })
  eventName: string;

  /**
   * Số lần event đã xảy ra
   * - Dùng cho EVENT_COUNT: số lần đã làm
   * - Dùng cho STREAK: độ dài streak hiện tại
   */
  @Column({ name: 'event_count', type: 'int', default: 0 })
  eventCount: number;

  /**
   * Metadata lưu thêm thông tin (dạng JSON)
   *
   * Cho STREAK achievements:
   * {
   *   currentStreak: 5,           // Streak hiện tại
   *   maxStreak: 12,              // Streak cao nhất từng đạt
   *   startDate: '2025-11-13',    // Ngày bắt đầu streak
   *   lastEventDate: '2025-11-17' // Ngày event cuối cùng
   * }
   *
   * Cho EVENT_COUNT (optional):
   * {
   *   firstEventAt: '2025-01-01',
   *   milestones: [10, 25, 50]  // Các mốc đã đạt
   * }
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Thời điểm event cuối cùng xảy ra
   * Dùng để:
   * - Check streak có bị break không
   * - Tính toán time-based achievements
   */
  @Column({ name: 'last_event_at', type: 'timestamp' })
  lastEventAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * ═══════════════════════════════════════════════════════════════
   * RELATIONSHIPS
   * ═══════════════════════════════════════════════════════════════
   */

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Achievement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @Column({ name: 'achievement_id' })
  achievementId: number;
}
