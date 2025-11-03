import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { learnerAchievementSeed } from './learner-achievement.seed';

/**
 * ============================================
 * SEED LEARNER ACHIEVEMENTS ONLY
 * ============================================
 * File seed riêng để tạo test data cho leaderboard
 * Chạy khi database đã có users và achievements
 */

export const runLearnerAchievementSeedOnly = async () => {
  let dataSource: DataSource;
  try {
    console.log('============================================================');
    console.log('🏅 SEEDING LEARNER ACHIEVEMENTS ONLY (TEST DATA)');
    console.log('============================================================\n');

    console.log('📡 Connecting to database...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected successfully!\n');

    await learnerAchievementSeed(dataSource);
    console.log('✅ Learner Achievement seed completed!\n');

    console.log('============================================================');
    console.log('🎉 LEARNER ACHIEVEMENT SEED COMPLETED!');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ LEARNER ACHIEVEMENT SEEDING FAILED!', error);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      console.log('🔌 Closing database connection...');
      await dataSource.destroy();
      console.log('✅ Database connection closed.\n');
    }
  }
};

runLearnerAchievementSeedOnly();

