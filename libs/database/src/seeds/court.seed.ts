import { DataSource } from 'typeorm';
import { Court } from '../entities/court.entity';
import { Province } from '../entities/province.entity';
import { AppDataSource } from '../data-source';

export const courtSeed = async (dataSource: DataSource) => {
  const courtRepo = dataSource.getRepository(Court);
  const provinceRepo = dataSource.getRepository(Province);

  const provinces = [
    'Thành phố Hà Nội',
    'Tỉnh Khánh Hòa',
    'Thành phố Hồ Chí Minh',
  ];

  for (const provinceName of provinces) {
    const existingProvince = await provinceRepo.findOne({
      where: { name: provinceName },
      relations: ['districts'],
    });
    for (const district of existingProvince.districts) {
      const newCourt = courtRepo.create({
        name: `Sân Pickleball ${district.name}`,
        phoneNumber: `+84${Math.floor(100000000 + Math.random() * 900000000)}`,
        pricePerHour: 250000,
        address: `123 Đường Lý Thường Kiệt, Phường 1`,
        province: existingProvince,
        district: district,
      });
      await courtRepo.save(newCourt);
    }
  }
};

// async function runSeed() {
//   await AppDataSource.initialize();
//   await courtSeed(AppDataSource);
//   await AppDataSource.destroy();
// }

// runSeed().catch((error) => {
//   console.error('Error seeding courts:', error);
//   process.exit(1);
// });
