import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Learner } from '../entities/learner.entity';
import { Coach } from '../entities/coach.entity';
import { Wallet } from '../entities/wallet.entity';
import { AuthProvider } from '../entities/auth-provider.entity';
import { PickleballLevel } from '../../../shared/src/enums/pickleball.enum';
import { CoachVerificationStatus } from '../../../shared/src/enums/coach.enum';
import { AuthProviderEnum } from '../../../shared/src/enums/auth.enum';

export const userSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const learnerRepository = dataSource.getRepository(Learner);
  const coachRepository = dataSource.getRepository(Coach);
  const walletRepository = dataSource.getRepository(Wallet);
  const authProviderRepository = dataSource.getRepository(AuthProvider);

  // Get roles
  const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
  const coachRole = await roleRepository.findOne({ where: { name: 'COACH' } });
  const learnerRole = await roleRepository.findOne({
    where: { name: 'LEARNER' },
  });
  const customerRole = await roleRepository.findOne({
    where: { name: 'CUSTOMER' },
  });

  if (!adminRole || !coachRole || !learnerRole || !customerRole) {
    throw new Error('Roles not found. Please seed roles first.');
  }

  // Create users
  const users = [
    {
      fullName: 'Quản trị viên',
      email: process.env.ADMIN_EMAIL || 'admin@pickleball.vn',
      role: adminRole,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '0901234567',
    },
    {
      fullName: 'Huấn luyện viên Nguyễn Văn A',
      email: process.env.COACH_EMAIL || 'coach.a@pickleball.vn',
      role: coachRole,
      password: await bcrypt.hash(process.env.COACH_PASSWORD || 'coach123', 10),
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '0902234567',
    },
    {
      fullName: 'Huấn luyện viên Trần Thị B',
      email: 'coach.b@pickleball.vn',
      role: coachRole,
      password: await bcrypt.hash('coach123', 10),
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '0903234567',
    },
    {
      fullName: 'Học viên Lê Văn C',
      email: process.env.LEARNER_EMAIL || 'learner.c@pickleball.vn',
      role: learnerRole,
      password: await bcrypt.hash(
        process.env.LEARNER_PASSWORD || 'learner123',
        10,
      ),
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '0904234567',
    },
    {
      fullName: 'Học viên Phạm Thị D',
      email: 'learner.d@pickleball.vn',
      role: learnerRole,
      password: await bcrypt.hash('learner123', 10),
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '0905234567',
    },
    {
      fullName: 'Khách hàng Võ Văn E',
      email: 'customer.e@pickleball.vn',
      role: customerRole,
      password: await bcrypt.hash('customer123', 10),
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '0906234567',
    },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    const savedUser = await userRepository.save(user);

    // Create wallet for each user
    const wallet = walletRepository.create({
      currentBalance: 0,
      totalIncome: 0,
      user: savedUser,
    });
    await walletRepository.save(wallet);

    // Create role-specific profiles
    if (savedUser.role.name === 'ADMIN') {
      const admin = userRepository.create({
        ...savedUser,
      });
      await userRepository.save(admin);
    } else if (savedUser.role.name === 'COACH') {
      const coach = coachRepository.create({
        user: savedUser,
        bio: 'Huấn luyện viên pickleball chuyên nghiệp với nhiều năm kinh nghiệm',
        yearOfExperience: Math.floor(Math.random() * 10) + 3,
        verificationStatus: CoachVerificationStatus.VERIFIED,
        specialties: [
          'Kỹ thuật cơ bản',
          'Chiến thuật thi đấu',
          'Phát bóng',
          'Phòng thủ',
        ],
        teachingMethods: [
          'Học qua video',
          'Thực hành trực tiếp',
          'Phân tích kỹ thuật',
        ],
      });
      await coachRepository.save(coach);
    } else if (savedUser.role.name === 'LEARNER') {
      const learner = learnerRepository.create({
        user: savedUser,
        skillLevel: PickleballLevel.BEGINNER,
        learningGoal: PickleballLevel.INTERMEDIATE,
      });
      await learnerRepository.save(learner);
    }
  }

  // Create auth providers for some users
  const authProviders = [
    {
      provider: 'google',
      providerId: 'google_123456789',
      user: users[0],
    },
    {
      provider: 'facebook',
      providerId: 'facebook_123456789',
      user: users[1],
    },
  ];

  for (const authProviderData of authProviders) {
    const user = await userRepository.findOne({
      where: { email: authProviderData.user.email },
    });
    if (user) {
      const authProvider = authProviderRepository.create({
        provider: authProviderData.provider as AuthProviderEnum,
        providerId: authProviderData.providerId,
        user: user,
      });
      await authProviderRepository.save(authProvider);
    }
  }

  console.log('Users seeded successfully');
};

// Keep the existing runSeed function for backward compatibility
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';

async function runSeed() {
  await AppDataSource.initialize();
  await userSeed(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error seeding users:', error);
  process.exit(1);
});
