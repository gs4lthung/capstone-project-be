import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Scope,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '@app/database/entities/user.entity';
import { Credential } from '@app/database/entities/credential.entity';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { RegisterCoachDto } from '@app/shared/dtos/coaches/register-coach.dto';
import { Role } from '@app/database/entities/role.entity';
import { AuthProvider } from '@app/database/entities/auth-provider.entity';
import { AuthProviderEnum } from '@app/shared/enums/auth.enum';
import { UserRole } from '@app/shared/enums/user.enum';
import { ConfigService } from '@app/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BaseTypeOrmService } from '@app/shared/helpers/typeorm.helper';
import { FindOptions } from '@app/shared/interfaces/find-options.interface';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import { Feedback } from '@app/database/entities/feedback.entity';
import { REQUEST } from '@nestjs/core';
import { CustomApiRequest } from '@app/shared/customs/custom-api-request';
import { Coach } from '@app/database/entities/coach.entity';
import { PaginateObject } from '@app/shared/dtos/paginate.dto';
import {
  CoachMonthlyRevenueRequestDto,
  CoachMonthlyRevenueResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { WalletTransactionType } from '@app/shared/enums/payment.enum';

@Injectable({ scope: Scope.REQUEST })
export class CoachService extends BaseTypeOrmService<Coach> {
  constructor(
    @Inject(REQUEST) private readonly request: CustomApiRequest,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly datasource: DataSource,
  ) {
    super(coachRepository);
  }

  async findAll(findOptions: FindOptions): Promise<PaginateObject<Coach>> {
    return super.find(findOptions, 'coach', PaginateObject<Coach>);
  }

  async findOne(id: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id: id },
      withDeleted: false,
      relations: ['user', 'credentials'],
    });

    if (!coach) throw new Error('Coach not found');

    return coach;
  }

  async getCoachOverallRating(id: number): Promise<CustomApiResponse<number>> {
    const feedbacks = await this.feedbackRepository.find({
      where: {
        receivedBy: { id: id },
      },
    });
    if (feedbacks.length === 0)
      return new CustomApiResponse<number>(
        HttpStatus.OK,
        'No feedbacks found',
        0,
      );
    const totalRating = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0,
    );
    const overallRating = totalRating / feedbacks.length;
    return new CustomApiResponse<number>(
      HttpStatus.OK,
      'Success',
      overallRating,
    );
  }

  async getCoachMonthlyRevenue(
    id: number,
    data: CoachMonthlyRevenueRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlyRevenueResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User not found');

    const walletTransaction = await this.walletTransactionRepository.find({
      where: {
        wallet: {
          user: { id: user.id },
        },
        type: WalletTransactionType.CREDIT,
      },
    });

    const isGetSingleMonthRevenue =
      data.month !== undefined && data.year !== undefined;

    let totalRevenue = 0;

    if (isGetSingleMonthRevenue) {
      totalRevenue = walletTransaction
        .filter(
          (transaction) =>
            transaction.createdAt.getMonth() + 1 === data.month &&
            transaction.createdAt.getFullYear() === data.year,
        )
        .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

      return new CustomApiResponse<CoachMonthlyRevenueResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              revenue: totalRevenue,
            },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);

      const monthlyData = months.map((month) => {
        const revenue = walletTransaction
          .filter(
            (transaction) =>
              transaction.createdAt.getMonth() + 1 === month &&
              transaction.createdAt.getFullYear() === currentYear,
          )
          .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

        return {
          month: `${month}/${currentYear}`,
          revenue,
        };
      });

      return new CustomApiResponse<CoachMonthlyRevenueResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async registerCoach(data: RegisterCoachDto): Promise<Coach> {
    // Check email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Check coach profile already exists (if user exists)
    const existed = await this.coachRepository.findOne({
      where: { user: { email: data.email } },
    });
    if (existed) throw new BadRequestException('Coach profile already exists');

    // Hash password
    const passwordHashed = await bcrypt.hash(
      data.password,
      this.configService.get('password_salt_rounds'),
    );

    // Get COACH role
    const coachRole = await this.roleRepository.findOne({
      where: { name: UserRole.COACH },
    });
    if (!coachRole) {
      throw new BadRequestException('Coach role not found');
    }

    // Create email verification token
    const emailVerificationToken = await this.jwtService.signAsync(
      { email: data.email },
      {
        secret: this.configService.get('jwt').verify_email_token.secret,
        expiresIn: this.configService.get('jwt').verify_email_token.expiration,
      },
    );

    // Create new user with COACH role
    const newUser = this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      password: passwordHashed,
      role: coachRole,
      authProviders: [
        {
          provider: AuthProviderEnum.LOCAL,
          providerId: data.email,
        } as AuthProvider,
      ],
      emailVerificationToken,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create coach profile
    const coach = this.coachRepository.create({
      bio: data.bio,
      specialties: data.specialties,
      teachingMethods: data.teachingMethods,
      yearOfExperience: data.yearOfExperience,
      verificationStatus: CoachVerificationStatus.UNVERIFIED,
      user: savedUser,
    });

    const savedCoach = await this.coachRepository.save(coach);

    if (data.credentials && data.credentials.length > 0) {
      const credentials = data.credentials.map((c) =>
        this.credentialRepository.create({
          name: c.name,
          description: c.description,
          type: c.type,
          publicUrl: c.publicUrl,
          coach: savedCoach,
        }),
      );
      await this.credentialRepository.save(credentials);
      savedCoach.credentials = credentials;
    }

    return savedCoach;
  }

  async verifyCoach(coachId: number): Promise<void> {
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
      relations: ['user'],
    });
    if (!coach) throw new NotFoundException('Coach not found');

    await this.coachRepository.update(coachId, {
      verificationStatus: CoachVerificationStatus.VERIFIED,
    });

    if (!coach.user.isActive) {
      await this.userRepository.update(coach.user.id, { isActive: true });
    }
  }

  async rejectCoach(coachId: number, reason?: string): Promise<void> {
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
    });
    if (!coach) throw new NotFoundException('Coach not found');

    await this.coachRepository.update(coachId, {
      verificationStatus: CoachVerificationStatus.REJECTED,
      verificationReason: reason,
    });

    return;
  }
}
