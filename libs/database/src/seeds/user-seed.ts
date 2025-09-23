import { UserRole } from '@app/shared/enums/user.enum';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthProvider } from '../entities/auth-provider.entity';
import { AuthProviderEnum } from '@app/shared/enums/auth.enum';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { PickleBallLevelEnum } from '@app/shared/enums/pickleball.enum';
async function runSeed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  const adminRole = await roleRepo.findOneBy({ name: UserRole.ADMIN });
  const coachRole = await roleRepo.findOneBy({ name: UserRole.COACH });
  const learnerRole = await roleRepo.findOneBy({ name: UserRole.LEARNER });
  if (!adminRole || !coachRole || !learnerRole) throw new Error('Invaid roles');

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

  const coach = userRepo.create({
    email: process.env.COACH_EMAIL,
    fullName: 'Coach',
    password: await bcrypt.hash(
      process.env.COACH_PASSWORD,
      parseInt(process.env.PASSWORD_SALT_ROUNDS),
    ),
    isEmailVerified: true,
    authProviders: [
      {
        provider: AuthProviderEnum.LOCAL,
        providerId: process.env.COACH_EMAIL,
      } as AuthProvider,
    ],
    role: coachRole,
    coachProfile: {
      bio: 'First init coach',
      basePrice: 10_000_000,
      specialties: 'MASTER ALL SKILL SETS',
      location: 'Ho Chi Minh city',
      latitude: 1,
      longitude: 1,
      verificationStatus: CoachVerificationStatus.APPROVED,
      credentials: [
        {
          title: 'MASTER PICKLE BALL',
          issueDate: '2024-09-17',
          issuedBy: 'hehe',
          credentialUrl: 'https://example.com',
        },
      ],
    },
  });

  const learner = userRepo.create({
    email: process.env.LEARNER_EMAIL,
    fullName: 'Learner',
    password: await bcrypt.hash(
      process.env.LEARNER_PASSWORD,
      parseInt(process.env.PASSWORD_SALT_ROUNDS),
    ),
    isEmailVerified: true,
    authProviders: [
      {
        provider: AuthProviderEnum.LOCAL,
        providerId: process.env.LEARNER_EMAIL,
      } as AuthProvider,
    ],
    role: learnerRole,
    learnerProfile: {
      location: 'Ho Chi Minh city',
      latitude: 1,
      longitude: 1,
      pickleballLevel: PickleBallLevelEnum.BEGINNER_1_0,
      pickleballLearnerGoal: PickleBallLevelEnum.INTERMEDIATE_3_0,
    },
  });

  await userRepo.save(admin);
  await userRepo.save(coach);
  await userRepo.save(learner);

  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding users:', error);
  process.exit(1);
});
