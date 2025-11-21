import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { roleSeed } from './role.seed';
import { seedBanks } from './bank.seed';
import { seedLocations } from './location.seed';
import { userSeed } from './user.seed';
import { achievementSeed } from './achievement.seed';
import { learnerAchievementSeed } from './learner-achievement.seed';
import { configurationSeed } from './configuration.seed';
import { courtSeed } from './court.seed';
import { subjectAndLessonSeed } from './subject-lesson.seed';

/**
 * ============================================
 * MAIN SEED FILE
 * ============================================
 * File này chạy tất cả các seed theo thứ tự
 * 
 * Thứ tự quan trọng (dependencies):
 * 1. role.seed - Tạo roles (ADMIN, COACH, LEARNER, CUSTOMER)
 * 2. bank.seed - Tạo danh sách ngân hàng
 * 3. location.seed - Tạo tỉnh/thành phố, quận/huyện
 * 4. configuration.seed - Tạo configurations
 * 5. court.seed - Tạo courts (cần locations)
 * 6. user.seed - Tạo users, wallets (cần roles)
 * 7. subject-lesson.seed - Tạo subjects, lessons, quizzes, videos (cần users/coaches)
 * 8. achievement.seed - Tạo achievements (cần admin user)
 * 9. learner-achievement.seed - Tạo earned achievements & progress (cần users & achievements)
 */

async function runSeed() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 STARTING COMPLETE DATABASE SEEDING');
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
    
    // 1. Role seed (MUST run first)
    console.log('👑 Running ROLE seed...');
    try {
      await roleSeed(dataSource);
      console.log('✅ Role seed completed!\n');
    } catch (error) {
      console.log('⚠️  Role seed skipped (roles already exist)\n');
    }

    // 2. Bank seed
    console.log('🏦 Running BANK seed...');
    try {
      await seedBanks(dataSource);
      console.log('✅ Bank seed completed!\n');
    } catch (error) {
      console.log('⚠️  Bank seed skipped (banks already exist)\n');
    }

    // 3. Location seed
    console.log('🌍 Running LOCATION seed...');
    try {
      await seedLocations(dataSource);
      console.log('✅ Location seed completed!\n');
    } catch (error) {
      console.log('⚠️  Location seed skipped (locations already exist)\n');
    }

    // 4. Configuration seed
    console.log('⚙️  Running CONFIGURATION seed...');
    try {
      await configurationSeed(dataSource);
      console.log('✅ Configuration seed completed!\n');
    } catch (error) {
      console.log('⚠️  Configuration seed skipped (configurations already exist)\n');
    }

    // 5. Court seed
    console.log('🏟️  Running COURT seed...');
    try {
      await courtSeed(dataSource);
      console.log('✅ Court seed completed!\n');
    } catch (error) {
      console.log('⚠️  Court seed skipped (courts already exist)\n');
    }

    // 6. User seed (includes users, wallets, learners, coaches)
    console.log('👥 Running USER seed...');
    try {
      await userSeed(dataSource);
      console.log('✅ User seed completed!\n');
    } catch (error) {
      console.log('⚠️  User seed skipped (users already exist)\n');
    }

    // 7. Subject and Lesson seed (includes subjects, lessons, quizzes, videos)
    console.log('📚 Running SUBJECT & LESSON seed...');
    try {
      await subjectAndLessonSeed(dataSource);
      console.log('✅ Subject & Lesson seed completed!\n');
    } catch (error) {
      console.log('⚠️  Subject & Lesson seed skipped (data already exists)\n');
      console.log(error);
    }

    // 8. Achievement seed
    console.log('🏆 Running ACHIEVEMENT seed...');
    await achievementSeed(dataSource);
    console.log('✅ Achievement seed completed!\n');

    // 9. Learner Achievement seed (TEST DATA for leaderboard)
    console.log('🏅 Running LEARNER ACHIEVEMENT seed (test data)...');
    try {
      await learnerAchievementSeed(dataSource);
      console.log('✅ Learner Achievement seed completed!\n');
    } catch (error) {
      console.log('⚠️  Learner Achievement seed skipped (data already exists)\n');
    }

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

