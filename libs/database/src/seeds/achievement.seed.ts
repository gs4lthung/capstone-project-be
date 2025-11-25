import { DataSource } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { EventCountAchievement } from '../entities/event-count-achievement.entity';
import { StreakAchievement } from '../entities/streak-achievement.entity';
import { PropertyCheckAchievement } from '../entities/property-check-achievement.entity';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../data-source';

/**
 * ============================================
 * ACHIEVEMENT SEED DATA
 * ============================================
 * Seed này tạo các achievement mẫu cho hệ thống
 *
 * Bao gồm:
 * - 7 EVENT_COUNT achievements (đếm số lần)
 * - 7 STREAK achievements (chuỗi liên tiếp)
 * - 7 PROPERTY_CHECK achievements (kiểm tra điều kiện)
 *
 * Total: 21 achievements
 */
export const achievementSeed = async (dataSource: DataSource) => {
  const achievementRepository = dataSource.getRepository(Achievement);
  const eventCountRepository = dataSource.getRepository(EventCountAchievement);
  const streakRepository = dataSource.getRepository(StreakAchievement);
  const propertyCheckRepository = dataSource.getRepository(
    PropertyCheckAchievement,
  );
  const userRepository = dataSource.getRepository(User);

  console.log('🏆 Starting Achievement seed...');

  // ============================================
  // Get Admin user (createdBy) - tìm bất kỳ admin nào
  // ============================================
  const adminUser = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('role.name = :roleName', { roleName: 'ADMIN' })
    .getOne();

  if (!adminUser) {
    console.error('❌ Admin user not found. Please seed users first.');
    return;
  }

  console.log(`✅ Found admin user: ${adminUser.fullName}`);

  // ============================================
  // Check if achievements already exist
  // ============================================
  const existingCount = await achievementRepository.count();
  if (existingCount > 0) {
    console.log(
      `⚠️  Achievements already seeded (${existingCount} records). Skipping...`,
    );
    return;
  }

  // ============================================
  // EVENT COUNT ACHIEVEMENTS (7 achievements)
  // ============================================
  console.log('\n📊 Creating EVENT_COUNT achievements...');

  const eventCountAchievements = [
    {
      name: 'Bước Đầu Tiên',
      description: 'Hoàn thành bài học đầu tiên của bạn',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=first-step',
      eventName: 'LESSON_COMPLETED',
      targetCount: 1,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Người Học Chăm Chỉ',
      description: 'Hoàn thành 10 bài học',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=hard-worker',
      eventName: 'LESSON_COMPLETED',
      targetCount: 10,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Học Giả',
      description: 'Hoàn thành 50 bài học',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=scholar',
      eventName: 'LESSON_COMPLETED',
      targetCount: 50,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Bậc Thầy Kiến Thức',
      description: 'Hoàn thành 100 bài học',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=master',
      eventName: 'LESSON_COMPLETED',
      targetCount: 100,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Người Tham Gia Tích Cực',
      description: 'Tham gia 5 buổi học trực tuyến',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=active-participant',
      eventName: 'SESSION_ATTENDED',
      targetCount: 5,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Chiến Binh Video',
      description: 'Xem 20 video bài giảng',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=video-warrior',
      eventName: 'VIDEO_WATCHED',
      targetCount: 20,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Người Hoàn Thành Khóa Học',
      description: 'Hoàn thành 3 khóa học',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=course-finisher',
      eventName: 'COURSE_COMPLETED',
      targetCount: 3,
      isActive: true,
      createdBy: adminUser,
    },
  ];

  for (const data of eventCountAchievements) {
    const achievement = eventCountRepository.create(data);
    await eventCountRepository.save(achievement);
    console.log(
      `  ✓ Created: ${data.name} (${data.eventName}, target: ${data.targetCount})`,
    );
  }

  // ============================================
  // STREAK ACHIEVEMENTS (7 achievements)
  // ============================================
  console.log('\n🔥 Creating STREAK achievements...');

  const streakAchievements = [
    {
      name: 'Đăng Nhập Hàng Ngày',
      description: 'Đăng nhập 3 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=daily-login',
      eventName: 'DAILY_LOGIN',
      targetStreakLength: 3,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Chiến Binh Tuần',
      description: 'Đăng nhập 7 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=week-warrior',
      eventName: 'DAILY_LOGIN',
      targetStreakLength: 7,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Người Kiên Trì Tháng',
      description: 'Đăng nhập 30 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=month-dedication',
      eventName: 'DAILY_LOGIN',
      targetStreakLength: 30,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Học Mỗi Ngày',
      description: 'Hoàn thành bài học 5 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=daily-study',
      eventName: 'DAILY_LESSON',
      targetStreakLength: 5,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Luyện Tập Đều Đặn',
      description: 'Làm quiz 7 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=daily-practice',
      eventName: 'DAILY_QUIZ',
      targetStreakLength: 7,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Tham Gia Tích Cực',
      description: 'Tham gia session 3 tuần liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=active-attendance',
      eventName: 'WEEKLY_SESSION',
      targetStreakLength: 3,
      streakUnit: 'weeks',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Video Hàng Ngày',
      description: 'Xem video 10 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=daily-video',
      eventName: 'DAILY_VIDEO',
      targetStreakLength: 10,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
  ];

  for (const data of streakAchievements) {
    const achievement = streakRepository.create(data);
    await streakRepository.save(achievement);
    console.log(
      `  ✓ Created: ${data.name} (${data.targetStreakLength} ${data.streakUnit} streak)`,
    );
  }

  // ============================================
  // PROPERTY CHECK ACHIEVEMENTS (7 achievements)
  // ============================================
  console.log('\n⭐ Creating PROPERTY_CHECK achievements...');

  const propertyCheckAchievements = [
    {
      name: 'Học Sinh Giỏi',
      description: 'Đạt điểm trung bình quiz >= 80%',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=excellent-student',
      eventName: 'QUIZ_COMPLETED',
      entityName: 'LearnerProgress',
      propertyName: 'avgQuizScore',
      comparisonOperator: '>=',
      targetValue: '80',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Học Sinh Xuất Sắc',
      description: 'Đạt điểm trung bình quiz >= 90%',
      iconUrl:
        'https://api.dicebear.com/7.x/icons/svg?seed=outstanding-student',
      eventName: 'QUIZ_COMPLETED',
      entityName: 'LearnerProgress',
      propertyName: 'avgQuizScore',
      comparisonOperator: '>=',
      targetValue: '90',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Hoàn Hảo',
      description: 'Đạt điểm quiz 100%',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=perfect-score',
      eventName: 'QUIZ_COMPLETED',
      entityName: 'Quiz',
      propertyName: 'score',
      comparisonOperator: '==',
      targetValue: '100',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Giáo Viên Được Yêu Thích',
      description: 'Coach đạt rating trung bình >= 4.5 sao',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=beloved-coach',
      eventName: 'FEEDBACK_RECEIVED',
      entityName: 'Coach',
      propertyName: 'averageRating',
      comparisonOperator: '>=',
      targetValue: '4.5',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Tiến Độ Vững Chắc',
      description: 'Đạt tiến độ khóa học >= 50%',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=solid-progress',
      eventName: 'LESSON_COMPLETED',
      entityName: 'LearnerProgress',
      propertyName: 'progress',
      comparisonOperator: '>=',
      targetValue: '50',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Sắp Hoàn Thành',
      description: 'Đạt tiến độ khóa học >= 80%',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=almost-done',
      eventName: 'LESSON_COMPLETED',
      entityName: 'LearnerProgress',
      propertyName: 'progress',
      comparisonOperator: '>=',
      targetValue: '80',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Người Tham Gia Tích Cực',
      description: 'Tham dự ít nhất 5 buổi session',
      iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=active-attendee',
      eventName: 'SESSION_ATTENDED',
      entityName: 'Enrollment',
      propertyName: 'sessionCount',
      comparisonOperator: '>=',
      targetValue: '5',
      isActive: true,
      createdBy: adminUser,
    },
  ];

  for (const data of propertyCheckAchievements) {
    const achievement = propertyCheckRepository.create(data);
    await propertyCheckRepository.save(achievement);
    console.log(
      `  ✓ Created: ${data.name} (${data.propertyName} ${data.comparisonOperator} ${data.targetValue})`,
    );
  }

  // ============================================
  // SUMMARY
  // ============================================
  const totalCount = await achievementRepository.count();
  console.log('\n' + '='.repeat(50));
  console.log('✅ Achievement seed completed!');
  console.log(`📊 Total achievements created: ${totalCount}`);
  console.log('   - EVENT_COUNT: 7 achievements');
  console.log('   - STREAK: 7 achievements');
  console.log('   - PROPERTY_CHECK: 7 achievements');
  console.log('='.repeat(50) + '\n');
};

async function runSeed() {
  await AppDataSource.initialize();
  await achievementSeed(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding banks:', error);
  process.exit(1);
});
