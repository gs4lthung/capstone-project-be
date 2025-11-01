import { DataSource } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { EventCountAchievement } from '../entities/event-count-achievement.entity';
import { StreakAchievement } from '../entities/streak-achievement.entity';
import { PropertyCheckAchievement } from '../entities/property-check-achievement.entity';
import { User } from '../entities/user.entity';

/**
 * ============================================
 * ACHIEVEMENT SEED DATA
 * ============================================
 * Seed này tạo các achievement mẫu cho hệ thống
 * 
 * Bao gồm:
 * - 5 EVENT_COUNT achievements (đếm số lần)
 * - 3 STREAK achievements (chuỗi liên tiếp)
 * - 2 PROPERTY_CHECK achievements (kiểm tra điều kiện)
 * 
 * Total: 10 achievements
 */
export const achievementSeed = async (dataSource: DataSource) => {
  const achievementRepository = dataSource.getRepository(Achievement);
  const eventCountRepository = dataSource.getRepository(EventCountAchievement);
  const streakRepository = dataSource.getRepository(StreakAchievement);
  const propertyCheckRepository = dataSource.getRepository(PropertyCheckAchievement);
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
    console.log(`⚠️  Achievements already seeded (${existingCount} records). Skipping...`);
    return;
  }

  // ============================================
  // EVENT COUNT ACHIEVEMENTS (5 achievements)
  // ============================================
  console.log('\n📊 Creating EVENT_COUNT achievements...');

  const eventCountAchievements = [
    {
      name: 'First Steps',
      description: 'Hoàn thành bài học đầu tiên của bạn',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=first-steps',
      eventName: 'LESSON_COMPLETED',
      targetCount: 1,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Learning Enthusiast',
      description: 'Hoàn thành 10 bài học',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=enthusiast',
      eventName: 'LESSON_COMPLETED',
      targetCount: 10,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Lesson Master',
      description: 'Hoàn thành 50 bài học',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=master',
      eventName: 'LESSON_COMPLETED',
      targetCount: 50,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Social Butterfly',
      description: 'Tham gia 10 buổi học',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=social',
      eventName: 'SESSION_ATTENDED',
      targetCount: 10,
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Quiz Champion',
      description: 'Hoàn thành 20 bài kiểm tra',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=quiz',
      eventName: 'QUIZ_COMPLETED',
      targetCount: 20,
      isActive: true,
      createdBy: adminUser,
    },
  ];

  for (const data of eventCountAchievements) {
    const achievement = eventCountRepository.create(data);
    await eventCountRepository.save(achievement);
    console.log(`  ✓ Created: ${data.name} (${data.eventName}, target: ${data.targetCount})`);
  }

  // ============================================
  // STREAK ACHIEVEMENTS (3 achievements)
  // ============================================
  console.log('\n🔥 Creating STREAK achievements...');

  const streakAchievements = [
    {
      name: 'Week Warrior',
      description: 'Đăng nhập 7 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=week-warrior',
      eventName: 'DAILY_LOGIN',
      targetStreakLength: 7,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Monthly Champion',
      description: 'Đăng nhập 30 ngày liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=monthly',
      eventName: 'DAILY_LOGIN',
      targetStreakLength: 30,
      streakUnit: 'days',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Attendance Star',
      description: 'Tham gia 5 buổi học liên tiếp',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=attendance',
      eventName: 'SESSION_ATTENDED',
      targetStreakLength: 5,
      streakUnit: 'sessions',
      isActive: true,
      createdBy: adminUser,
    },
  ];

  for (const data of streakAchievements) {
    const achievement = streakRepository.create(data);
    await streakRepository.save(achievement);
    console.log(`  ✓ Created: ${data.name} (${data.targetStreakLength} ${data.streakUnit} streak)`);
  }

  // ============================================
  // PROPERTY CHECK ACHIEVEMENTS (2 achievements)
  // ============================================
  console.log('\n⭐ Creating PROPERTY_CHECK achievements...');

  const propertyCheckAchievements = [
    {
      name: 'Top Performer',
      description: 'Đạt điểm trung bình >= 80 trong các bài kiểm tra',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=performer',
      eventName: 'QUIZ_COMPLETED',
      entityName: 'LearnerProgress',
      propertyName: 'avgQuizScore',
      comparisonOperator: '>=',
      targetValue: '80',
      isActive: true,
      createdBy: adminUser,
    },
    {
      name: 'Perfect Score',
      description: 'Đạt điểm 100 trong một bài kiểm tra',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=perfect',
      eventName: 'QUIZ_COMPLETED',
      entityName: 'QuizAttempt',
      propertyName: 'score',
      comparisonOperator: '==',
      targetValue: '100',
      isActive: true,
      createdBy: adminUser,
    },
  ];

  for (const data of propertyCheckAchievements) {
    const achievement = propertyCheckRepository.create(data);
    await propertyCheckRepository.save(achievement);
    console.log(`  ✓ Created: ${data.name} (${data.propertyName} ${data.comparisonOperator} ${data.targetValue})`);
  }

  // ============================================
  // SUMMARY
  // ============================================
  const totalCount = await achievementRepository.count();
  console.log('\n' + '='.repeat(50));
  console.log('✅ Achievement seed completed!');
  console.log(`📊 Total achievements created: ${totalCount}`);
  console.log('   - EVENT_COUNT: 5 achievements');
  console.log('   - STREAK: 3 achievements');
  console.log('   - PROPERTY_CHECK: 2 achievements');
  console.log('='.repeat(50) + '\n');
};

