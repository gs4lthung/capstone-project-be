import { DataSource } from 'typeorm';
import { Bank } from '../entities/bank.entity';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
export const seedBanks = async (dataSourse: DataSource) => {
  const bankRepository = dataSourse.getRepository(Bank);

  // Check if banks already exist
  const existingBankCount = await bankRepository.count();
  if (existingBankCount > 0) {
    console.log(
      `⚠️  Banks already exist (${existingBankCount} records). Skipping seed.`,
    );
    return;
  }

  const jsonPath = path.join(__dirname, '../../../../data/bank.json');
  const bankData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`📝 Seeding ${bankData.length} banks...`);

  for (const bankItem of bankData) {
    const bank = bankRepository.create({
      name: bankItem.name,
      bin: bankItem.bin,
    });
    await bankRepository.save(bank);
  }

  console.log(`  ✅ Successfully seeded ${bankData.length} banks`);
};

// ============================================
// Run this file directly (optional)
// ============================================
// Uncomment below to run this seed file standalone

async function runSeed() {
  await AppDataSource.initialize();
  await seedBanks(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding banks:', error);
  process.exit(1);
});
