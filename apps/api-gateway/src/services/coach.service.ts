import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Scope,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
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
  CoachMonthlyCourseRequestDto,
  CoachMonthlyCourseResponseDto,
  CoachMonthlyLearnerRequestDto,
  CoachMonthlyLearnerResponseDto,
  CoachMonthlyRevenueRequestDto,
  CoachMonthlyRevenueResponseDto,
  CoachMonthlySessionRequestDto,
  CoachMonthlySessionResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { WalletTransactionType } from '@app/shared/enums/payment.enum';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { Session } from '@app/database/entities/session.entity';
import { SessionStatus } from '@app/shared/enums/session.enum';
import { Course } from '@app/database/entities/course.entity';
import { CourseStatus } from '@app/shared/enums/course.enum';

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
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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

  async getOverallRating(id: number): Promise<CustomApiResponse<number>> {
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

  async getMonthlyRevenue(
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

      const month = Number(data.month);
      const year = Number(data.year);

      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;

      const previousRevenue = walletTransaction
        .filter(
          (transaction) =>
            transaction.createdAt.getMonth() + 1 === previousMonth &&
            transaction.createdAt.getFullYear() === previousYear,
        )
        .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

      const increaseFromLastMonth =
        previousRevenue === 0
          ? null
          : Number(
              (
                ((totalRevenue - previousRevenue) / previousRevenue) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<CoachMonthlyRevenueResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${month}/${year}`,
              revenue: totalRevenue,
              increaseFromLastMonth,
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

  async getMonthlyLearnerCount(
    id: number,
    data: CoachMonthlyLearnerRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlyLearnerResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User not found');

    const isGetSingleMonthLearnerCount =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthLearnerCount) {
      const month = Number(data.month);
      const year = Number(data.year);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const learnerCount = await this.enrollmentRepository.count({
        where: {
          course: {
            createdBy: { id: user.id },
          },
          enrolledAt: Between(startDate, endDate),
          status: In([EnrollmentStatus.LEARNING, EnrollmentStatus.CONFIRMED]),
        },
      });

      const lastMonthStartDate =
        month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
      const lastMonthEndDate =
        month === 1
          ? new Date(year - 1, 11, 31, 23, 59, 59, 999)
          : new Date(year, month - 1, 0, 23, 59, 59, 999);
      const lastMonthLearnerCount = await this.enrollmentRepository.count({
        where: {
          course: {
            createdBy: { id: user.id },
          },
          enrolledAt: Between(lastMonthStartDate, lastMonthEndDate),
          status: In([EnrollmentStatus.LEARNING, EnrollmentStatus.CONFIRMED]),
        },
      });

      const increaseFromLastMonth =
        lastMonthLearnerCount === 0
          ? null
          : Number(
              (
                ((learnerCount - lastMonthLearnerCount) /
                  lastMonthLearnerCount) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<CoachMonthlyLearnerResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            { month: `${month}/${year}`, learnerCount, increaseFromLastMonth },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];

      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const learnerCount = await this.enrollmentRepository.count({
          where: {
            course: { createdBy: { id: user.id } },
            enrolledAt: Between(startDate, endDate),
            status: In([EnrollmentStatus.LEARNING, EnrollmentStatus.CONFIRMED]),
          },
        });
        monthlyData.push({ month: `${month}/${currentYear}`, learnerCount });
      }

      return new CustomApiResponse<CoachMonthlyLearnerResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyCourseCount(
    id: number,
    data: CoachMonthlyCourseRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlyCourseResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User not found');

    const isGetSingleMonthCourseCount =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthCourseCount) {
      const month = Number(data.month);
      const year = Number(data.year);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      const courseCount = await this.courseRepository.count({
        where: {
          createdBy: { id: user.id },
          createdAt: Between(startDate, endDate),
          status: In([
            CourseStatus.APPROVED,
            CourseStatus.READY_OPENED,
            CourseStatus.FULL,
            CourseStatus.ON_GOING,
            CourseStatus.COMPLETED,
          ]),
        },
      });

      const lastMonthStartDate =
        month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
      const lastMonthEndDate =
        month === 1
          ? new Date(year - 1, 11, 31, 23, 59, 59, 999)
          : new Date(year, month - 1, 0, 23, 59, 59, 999);
      const lastMonthCourseCount = await this.courseRepository.count({
        where: {
          createdBy: { id: user.id },
          createdAt: Between(lastMonthStartDate, lastMonthEndDate),
          status: In([
            CourseStatus.APPROVED,
            CourseStatus.READY_OPENED,
            CourseStatus.FULL,
            CourseStatus.ON_GOING,
            CourseStatus.COMPLETED,
          ]),
        },
      });
      const increaseFromLastMonth =
        lastMonthCourseCount === 0
          ? null
          : Number(
              (
                ((courseCount - lastMonthCourseCount) / lastMonthCourseCount) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<CoachMonthlyCourseResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            { month: `${month}/${year}`, courseCount, increaseFromLastMonth },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];
      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const courseCount = await this.courseRepository.count({
          where: {
            createdBy: { id: user.id },
            createdAt: Between(startDate, endDate),
            status: In([
              CourseStatus.APPROVED,
              CourseStatus.READY_OPENED,
              CourseStatus.FULL,
              CourseStatus.ON_GOING,
              CourseStatus.COMPLETED,
            ]),
          },
        });
        monthlyData.push({ month: `${month}/${currentYear}`, courseCount });
      }
      return new CustomApiResponse<CoachMonthlyCourseResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlySessionCount(
    id: number,
    data: CoachMonthlySessionRequestDto,
  ): Promise<CustomApiResponse<CoachMonthlySessionResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User not found');

    const isGetSingleMonthSessionCount =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthSessionCount) {
      const month = Number(data.month);
      const year = Number(data.year);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const sessionCount = await this.sessionRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
          course: {
            createdBy: { id: user.id },
          },
          status: In([SessionStatus.SCHEDULED, SessionStatus.COMPLETED]),
        },
      });
      const lastMonthStartDate =
        month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
      const lastMonthEndDate =
        month === 1
          ? new Date(year - 1, 11, 31, 23, 59, 59, 999)
          : new Date(year, month - 1, 0, 23, 59, 59, 999);
      const lastMonthSessionCount = await this.sessionRepository.count({
        where: {
          createdAt: Between(lastMonthStartDate, lastMonthEndDate),
          course: {
            createdBy: { id: user.id },
          },
          status: In([SessionStatus.SCHEDULED, SessionStatus.COMPLETED]),
        },
      });

      const increaseFromLastMonth =
        lastMonthSessionCount === 0
          ? null
          : Number(
              (
                ((sessionCount - lastMonthSessionCount) /
                  lastMonthSessionCount) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<CoachMonthlySessionResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            { month: `${month}/${year}`, sessionCount, increaseFromLastMonth },
          ],
        },
      );
    } else {
      const currentYear = data.year || new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = [];
      for (const month of months) {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
        const sessionCount = await this.sessionRepository.count({
          where: {
            createdAt: Between(startDate, endDate),
            course: { createdBy: { id: user.id } },
            status: In([SessionStatus.SCHEDULED, SessionStatus.COMPLETED]),
          },
        });
        monthlyData.push({ month: `${month}/${currentYear}`, sessionCount });
      }
      return new CustomApiResponse<CoachMonthlySessionResponseDto>(
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
