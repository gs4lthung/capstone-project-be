import { RoleEnum } from '@app/shared/enums/role.enum';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthProvider } from '../entities/auth-provider.entity';
import { AuthProviderEnum } from '@app/shared/enums/auth.enum';
async function runSeed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  const adminRole = await roleRepo.findOneBy({ name: RoleEnum.ADMIN });
  if (!adminRole) {
    throw new Error('Admin role not found. Please seed roles first.');
  }

  const admin = userRepo.create({
    email: process.env.ADMIN_EMAIL,
    fullName: 'Admin',
    password: await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      parseInt(process.env.PASSWORD_SALT_ROUNDS),
    ),
    isEmailVerified: true,
    authProviders: [
      {
        provider: AuthProviderEnum.LOCAL,
        providerId: process.env.ADMIN_EMAIL,
      } as AuthProvider,
    ],
    role: adminRole,
  });

  await userRepo.save(admin);

  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding users:', error);
  process.exit(1);
});
