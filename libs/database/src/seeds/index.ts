import { AppDataSource } from '../data-source';
import { roleSeed } from './role.seed';
import { userSeed } from './user.seed';
import { seedBanks } from './bank.seed';
import { seedLocations } from './location.seed';

async function runAllSeeds() {
  try {
    console.log('Starting database seeding...');

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Run seeds in sequence: role -> user -> bank -> location
    console.log('Seeding roles...');
    await roleSeed(AppDataSource);
    console.log('✓ Roles seeded successfully');

    console.log('Seeding users...');
    await userSeed(AppDataSource);
    console.log('✓ Users seeded successfully');

    console.log('Seeding banks...');
    await seedBanks(AppDataSource);
    console.log('✓ Banks seeded successfully');

    console.log('Seeding locations...');
    await seedLocations(AppDataSource);
    console.log('✓ Locations seeded successfully');

    // Close database connection
    await AppDataSource.destroy();
    console.log('Database connection closed');

    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

// Export the seed runner for external use
export { runAllSeeds };

// Run seeds if this file is executed directly
if (require.main === module) {
  runAllSeeds();
}
