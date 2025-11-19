import { DataSource } from 'typeorm';
import { Province } from '../entities/province.entity';
import { District } from '../entities/district.entity';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';

export const seedLocations = async (dataSource: DataSource) => {
  const provinceRepository = dataSource.getRepository(Province);
  const districtRepository = dataSource.getRepository(District);

  // Check if data already exists
  const provinceCount = await provinceRepository.count();
  if (provinceCount > 0) {
    console.log('Location data already exists. Skipping seed.');
    return;
  }

  // Read JSON data
  const jsonPath = path.join(__dirname, '../../../../data/location.json');
  const locationData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(
    `Seeding ${locationData.length} provinces and their districts...`,
  );

  for (const provinceData of locationData) {
    // Create province
    const province = provinceRepository.create({
      name: provinceData.name,
    });

    const savedProvince = await provinceRepository.save(province);

    // Create districts for this province
    const districts = provinceData.districts.map((districtData: any) => {
      return districtRepository.create({
        name: districtData.name,
        province: savedProvince,
      });
    });

    await districtRepository.save(districts);
    console.log(`Seeded ${province.name} with ${districts.length} districts`);
  }

  console.log('  ✅ Location seeding completed successfully!');
};

// ============================================
// Run this file directly (optional)
// ============================================
// Uncomment below to run this seed file standalone

// async function runSeed() {
//   await AppDataSource.initialize();
//   await seedLocations(AppDataSource);
//   await AppDataSource.destroy();
// }

// runSeed().catch((error) => {
//   console.error('Error seeding locations:', error);
//   process.exit(1);
// });
