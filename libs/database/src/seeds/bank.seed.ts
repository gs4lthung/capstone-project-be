import { DataSource } from 'typeorm';
import { Bank } from '../entities/bank.entity';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
export const seedBanks = async (dataSourse: DataSource) => {
  const bankRepository = dataSourse.getRepository(Bank);

  const jsonPath = path.join(__dirname, '../../../../data/bank.json');
  const bankData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const bankItem of bankData) {
    const bank = bankRepository.create({
      name: bankItem.name,
      bin: bankItem.bin,
    });
    await bankRepository.save(bank);
    console.log(`Seeded bank: ${bank.name}`);
  }
};

async function runSeed() {
  await AppDataSource.initialize();
  await seedBanks(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding banks:', error);
  process.exit(1);
});
