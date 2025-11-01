import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { achievementSeed } from './achievement.seed';

/**
 * ============================================
 * SEED CHỈ ACHIEVEMENTS
 * ============================================
 * File này chỉ chạy achievement seed, không chạy user seed
 */

async function runAchievementSeedOnly() {
  console.log('\n' + '='.repeat(60));
  console.log('🏆 SEEDING ACHIEVEMENTS ONLY');
  console.log('='.repeat(60) + '\n');

  let dataSource: DataSource;

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected successfully!\n');

    // Run achievement seed
    await achievementSeed(dataSource);

    // Success
    console.log('='.repeat(60));
    console.log('🎉 ACHIEVEMENT SEED COMPLETED!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ACHIEVEMENT SEEDING FAILED!');
    console.error('='.repeat(60));
    console.error('\nError details:');
    console.error(error);
    console.error('\n' + '='.repeat(60) + '\n');
    process.exit(1);

  } finally {
    if (dataSource && dataSource.isInitialized) {
      console.log('🔌 Closing database connection...');
      await dataSource.destroy();
      console.log('✅ Database connection closed.\n');
    }
  }
}

runAchievementSeedOnly();

