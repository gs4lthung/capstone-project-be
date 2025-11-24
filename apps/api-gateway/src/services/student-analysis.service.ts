import { Course } from '@app/database/entities/course.entity';
import { Enrollment } from '@app/database/entities/enrollment.entity';
import { Session } from '@app/database/entities/session.entity';
import { User } from '@app/database/entities/user.entity';
import { WalletTransaction } from '@app/database/entities/wallet-transaction.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  MonthlyRequestDto,
  MonthlyResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { EnrollmentStatus } from '@app/shared/enums/enrollment.enum';
import { WalletTransactionType } from '@app/shared/enums/payment.enum';
import { SessionStatus } from '@app/shared/enums/session.enum';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class StudentAnalysisService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}
  async getMonthlyRevenue(
    userId: number,
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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

      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${month}/${year}`,
              data: totalRevenue,
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
          data: revenue,
        };
      });

      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyLearnerCount(
    userId: number,
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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
          status: In([
            EnrollmentStatus.LEARNING,
            EnrollmentStatus.CONFIRMED,
            EnrollmentStatus.DONE,
          ]),
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
          status: In([
            EnrollmentStatus.LEARNING,
            EnrollmentStatus.CONFIRMED,
            EnrollmentStatus.DONE,
          ]),
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

      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${month}/${year}`,
              data: learnerCount,
              increaseFromLastMonth,
            },
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
            status: In([
              EnrollmentStatus.LEARNING,
              EnrollmentStatus.CONFIRMED,
              EnrollmentStatus.DONE,
            ]),
          },
        });
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: learnerCount,
        });
      }

      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyCourseCount(
    id: number,
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
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

      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${month}/${year}`,
              data: courseCount,
              increaseFromLastMonth,
            },
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
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: courseCount,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlySessionCount(
    userId: number,
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${month}/${year}`,
              data: sessionCount,
              increaseFromLastMonth,
            },
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
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: sessionCount,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }
}
