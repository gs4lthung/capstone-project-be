import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { userSeed } from './user.seed';
import { achievementSeed } from './achievement.seed';

/**
 * ============================================
 * MAIN SEED FILE
 * ============================================
 * File này chạy tất cả các seed theo thứ tự
 * 
 * Thứ tự quan trọng:
 * 1. user.seed - Tạo users (bao gồm admin)
 * 2. achievement.seed - Tạo achievements (cần admin user)
 */

async function runSeed() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 STARTING DATABASE SEEDING');
  console.log('='.repeat(60) + '\n');

  let dataSource: DataSource;

  try {
    // ============================================
    // Connect to database
    // ============================================
    console.log('📡 Connecting to database...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected successfully!\n');

    // ============================================
    // Run seeds in order
    // ============================================
    
    // 1. User seed (includes roles, users, wallets)
    console.log('👥 Running USER seed...');
    try {
      await userSeed(dataSource);
      console.log('✅ User seed completed!\n');
    } catch (error) {
      console.log('⚠️  User seed skipped (users already exist)\n');
    }

    // 2. Achievement seed
    console.log('🏆 Running ACHIEVEMENT seed...');
    await achievementSeed(dataSource);
    console.log('✅ Achievement seed completed!\n');

    // ============================================
    // Success summary
    // ============================================
    console.log('='.repeat(60));
    console.log('🎉 ALL SEEDS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    // ============================================
    // Error handling
    // ============================================
    console.error('\n' + '='.repeat(60));
    console.error('❌ SEEDING FAILED!');
    console.error('='.repeat(60));
    console.error('\nError details:');
    console.error(error);
    console.error('\n' + '='.repeat(60) + '\n');
    process.exit(1);

  } finally {
    // ============================================
    // Cleanup: Close database connection
    // ============================================
    if (dataSource && dataSource.isInitialized) {
      console.log('🔌 Closing database connection...');
      await dataSource.destroy();
      console.log('✅ Database connection closed.\n');
    }
  }
}

// ============================================
// Execute seed
// ============================================
runSeed();

