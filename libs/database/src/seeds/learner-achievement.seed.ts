import { DataSource } from 'typeorm';
import { LearnerAchievement } from '../entities/learner-achievement.entity';
import { AchievementProgress } from '../entities/achievement-progress.entity';
import { Achievement } from '../entities/achievement.entity';
import { User } from '../entities/user.entity';

/**
 * ============================================
 * LEARNER ACHIEVEMENT SEED
 * ============================================
 * Tạo data test cho:
 * - Earned achievements (learner_achievements)
 * - Achievement progress (achievement_progresses)
 *
 * Mục đích: Test leaderboard và progress APIs
 */

export const learnerAchievementSeed = async (dataSource: DataSource) => {
  const learnerAchievementRepository =
    dataSource.getRepository(LearnerAchievement);
  const achievementProgressRepository =
    dataSource.getRepository(AchievementProgress);
  const achievementRepository = dataSource.getRepository(Achievement);
  const userRepository = dataSource.getRepository(User);

  console.log('🏅 Starting Learner Achievement seed...');

  // Check if data already exists
  const existingCount = await learnerAchievementRepository.count();
  if (existingCount > 0) {
    console.log(
      `⚠️  Learner achievements already exist (${existingCount} records). Skipping seed.`,
    );
    return;
  }

  // ============================================
  // Lấy data từ database
  // ============================================

  // Lấy tất cả achievements
  const achievements = await achievementRepository.find({
    where: { isActive: true },
    take: 10, // Lấy 10 achievements đầu tiên
  });

  if (achievements.length === 0) {
    console.log('❌ No achievements found. Please run achievement seed first.');
    return;
  }

  // Lấy tất cả learner users
  const learners = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('role.name = :roleName', { roleName: 'LEARNER' })
    .take(10) // Lấy 10 learners đầu tiên
    .getMany();

  if (learners.length === 0) {
    console.log('❌ No learner users found. Please run user seed first.');
    return;
  }

  console.log(
    `📝 Found ${achievements.length} achievements and ${learners.length} learners`,
  );
  console.log(`📝 Creating earned achievements and progress records...`);

  // ============================================
  // Tạo earned achievements (random distribution)
  // ============================================

  let totalEarned = 0;
  let totalProgress = 0;

  // Mỗi learner sẽ earn từ 0-8 achievements (random)
  for (const learner of learners) {
    const numToEarn = Math.floor(Math.random() * 9); // 0-8 achievements

    // Shuffle achievements để random
    const shuffledAchievements = [...achievements].sort(
      () => Math.random() - 0.5,
    );

    for (let i = 0; i < numToEarn && i < shuffledAchievements.length; i++) {
      const achievement = shuffledAchievements[i];

      // Tạo earned achievement
      const earnedAchievement = learnerAchievementRepository.create({
        user: learner,
        achievement: achievement,
        earnedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ), // Random trong 30 ngày qua
      });

      await learnerAchievementRepository.save(earnedAchievement);
      totalEarned++;
    }

    // Tạo progress cho những achievements chưa earn (in progress)
    const unearnedAchievements = shuffledAchievements.slice(numToEarn);

    for (const achievement of unearnedAchievements) {
      // Random progress từ 0-99%
      const randomProgress = Math.floor(Math.random() * 100);

      if (randomProgress > 0) {
        const progress = achievementProgressRepository.create({
          user: learner,
          achievement: achievement,
          currentProgress: randomProgress,
        });

        await achievementProgressRepository.save(progress);
        totalProgress++;
      }
    }
  }

  console.log(`  ✅ Created ${totalEarned} earned achievements`);
  console.log(`  ✅ Created ${totalProgress} progress records`);
  console.log('✅ Learner Achievement seed completed!\n');
};

// ============================================
// Run this file directly (optional)
// ============================================
// Uncomment below to run this seed file standalone
/*
import { AppDataSource } from '../data-source';

async function runSeed() {
  await AppDataSource.initialize();
  await learnerAchievementSeed(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding learner achievements:', error);
  process.exit(1);
});
*/
