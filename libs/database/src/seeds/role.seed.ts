import { UserRole } from '@app/shared/enums/user.enum';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';

async function runSeed() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);

  const roles = UserRole;

  for (const role of Object.values(roles)) {
    await roleRepo.save(roleRepo.create({ name: role }));
  }

  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding roles:', error);
  process.exit(1);
});
