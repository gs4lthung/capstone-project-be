import { UserRole } from '@app/shared/enums/user.enum';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { DataSource } from 'typeorm';

export const roleSeed = async (dataSource: DataSource) => {
  const roleRepo = dataSource.getRepository(Role);

  // Check if roles already exist
  const existingRoleCount = await roleRepo.count();
  if (existingRoleCount > 0) {
    console.log('⚠️  Roles already exist. Skipping seed.');
    return;
  }

  const roles = UserRole;
  console.log(`📝 Seeding ${Object.values(roles).length} roles...`);

  for (const role of Object.values(roles)) {
    await roleRepo.save(roleRepo.create({ name: role }));
    console.log(`  ✅ Created role: ${role}`);
  }
};

// async function runSeed() {
//   await AppDataSource.initialize();
//   await roleSeed(AppDataSource);
//   await AppDataSource.destroy();
// }

// runSeed().catch((error) => {
//   console.error('Error seeding roles:', error);
//   process.exit(1);
// });
