import { Course } from '@app/database/entities/course.entity';
import { Payment } from '@app/database/entities/payment.entity';
import { SessionEarning } from '@app/database/entities/session-earning.entity';
import { User } from '@app/database/entities/user.entity';
import { Session } from '@app/database/entities/session.entity';
import { Feedback } from '@app/database/entities/feedback.entity';
import { Request } from '@app/database/entities/request.entity';
import { Coach } from '@app/database/entities/coach.entity';
import { Learner } from '@app/database/entities/learner.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  AnalysisResponseDto,
  AnalysisType,
  MonthlyRequestDto,
  YearlyRequestDto,
  WeeklyRequestDto,
  PreviouslyRequestDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { DashboardOverviewDto } from '@app/shared/dtos/platform-analysis/dashboard-overview.dto';
import { CourseStatus } from '@app/shared/enums/course.enum';
import { PaymentStatus } from '@app/shared/enums/payment.enum';

import { UserRole } from '@app/shared/enums/user.enum';
import { CoachVerificationStatus } from '@app/shared/enums/coach.enum';
import { RequestStatus } from '@app/shared/enums/request.enum';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Not, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class PlatformAnalysisService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(SessionEarning)
    private readonly sessionEarningRepository: Repository<SessionEarning>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Learner)
    private readonly learnerRepository: Repository<Learner>,
  ) {}

  async getNewUsers(
    type: AnalysisType,
    data:
      | MonthlyRequestDto
      | YearlyRequestDto
      | WeeklyRequestDto
      | PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    switch (type) {
      case AnalysisType.WEEKLY:
        return this.getWeeklyNewUsers(data as WeeklyRequestDto);
      case AnalysisType.MONTHLY:
        return this.getMonthlyNewUsers(data as MonthlyRequestDto);
      case AnalysisType.PREVIOUSLY:
        return this.getPreviouslyNewUsers(data as PreviouslyRequestDto);
      case AnalysisType.YEARLY:
        return this.getYearlyNewUsers(data as YearlyRequestDto);
      default:
        throw new BadRequestException('Không hợp lệ loại phân tích');
    }
  }

  private async getMonthlyNewUsers(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const isGetSingleMonthNewUser =
      data.month !== undefined && data.year !== undefined;
    if (isGetSingleMonthNewUser) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);
      const newUsers = await this.userRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
          role: {
            name: Not(UserRole.ADMIN),
          },
        },
      });

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthUsers = await this.userRepository.find({
        where: {
          createdAt: Between(lastMonthStartDate, lastMonthEndDate),
          role: {
            name: Not(UserRole.ADMIN),
          },
        },
      });

      const increaseFromLastMonth =
        lastMonthUsers.length === 0
          ? newUsers.length === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((newUsers.length - lastMonthUsers.length) /
                  lastMonthUsers.length) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `${data.month}/${data.year}`,
              data: newUsers.length,
              increaseFromLast: increaseFromLastMonth,
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
        const newUsers = await this.userRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
            role: {
              name: Not(UserRole.ADMIN),
            },
          },
        });
        monthlyData.push({
          type: `${month}/${currentYear}`,
          data: newUsers.length,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  private async getWeeklyNewUsers(
    data: WeeklyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;

    const isGetSingleWeek = data.week !== undefined;

    if (isGetSingleWeek) {
      const weekNumber = data.week;
      const startDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7 + 1,
      );
      const endDate = new Date(
        currentYear,
        currentMonth - 1,
        weekNumber * 7,
        23,
        59,
        59,
        999,
      );

      const newUsers = await this.userRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
          role: {
            name: Not(UserRole.ADMIN),
          },
        },
      });

      const lastWeekStartDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 2) * 7 + 1,
      );
      const lastWeekEndDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7,
        23,
        59,
        59,
        999,
      );

      const lastWeekUsers = await this.userRepository.find({
        where: {
          createdAt: Between(lastWeekStartDate, lastWeekEndDate),
          role: {
            name: Not(UserRole.ADMIN),
          },
        },
      });

      const increaseFromLastWeek =
        lastWeekUsers.length === 0
          ? newUsers.length === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((newUsers.length - lastWeekUsers.length) /
                  lastWeekUsers.length) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `Week ${weekNumber} - ${currentMonth}/${currentYear}`,
              data: newUsers.length,
              increaseFromLast: increaseFromLastWeek,
            },
          ],
        },
      );
    } else {
      const weeklyData = [];
      const weeksInMonth = 5;

      for (let week = 1; week <= weeksInMonth; week++) {
        const startDate = new Date(
          currentYear,
          currentMonth - 1,
          (week - 1) * 7 + 1,
        );
        const endDate = new Date(
          currentYear,
          currentMonth - 1,
          week * 7,
          23,
          59,
          59,
          999,
        );

        const newUsers = await this.userRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
            role: {
              name: Not(UserRole.ADMIN),
            },
          },
        });

        weeklyData.push({
          type: `Week ${week} - ${currentMonth}/${currentYear}`,
          data: newUsers.length,
        });
      }

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: weeklyData,
        },
      );
    }
  }

  private async getPreviouslyNewUsers(
    data: PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;
    const currentDay = data.day || currentDate.getDate();

    const startDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      0,
      0,
      0,
      0,
    );
    const endDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      23,
      59,
      59,
      999,
    );

    const newUsers = await this.userRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        role: {
          name: Not(UserRole.ADMIN),
        },
      },
    });

    const previousDayStartDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      0,
      0,
      0,
      0,
    );
    const previousDayEndDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      23,
      59,
      59,
      999,
    );

    const previousDayUsers = await this.userRepository.find({
      where: {
        createdAt: Between(previousDayStartDate, previousDayEndDate),
        role: {
          name: Not(UserRole.ADMIN),
        },
      },
    });

    const increaseFromPreviousDay =
      previousDayUsers.length === 0
        ? newUsers.length === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((newUsers.length - previousDayUsers.length) /
                previousDayUsers.length) *
              100
            ).toFixed(2),
          );

    return new CustomApiResponse<AnalysisResponseDto>(
      HttpStatus.OK,
      'Success',
      {
        data: [
          {
            type: `${currentDay}/${currentMonth}/${currentYear}`,
            data: newUsers.length,
            increaseFromLast: increaseFromPreviousDay,
          },
        ],
      },
    );
  }

  private async getYearlyNewUsers(
    data: YearlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return await this.datasource.transaction<
      CustomApiResponse<AnalysisResponseDto>
    >(async (manager) => {
      const currentYear = data.year || new Date().getFullYear();
      const yearsToFetch = 5;
      const yearlyData = [];
      for (let yearOffset = 0; yearOffset < yearsToFetch; yearOffset++) {
        const year = currentYear - yearOffset;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const newUsers = await manager.find(User, {
          where: {
            createdAt: Between(startDate, endDate),
            role: {
              name: Not(UserRole.ADMIN),
            },
          },
        });

        const lastYearStartDate = new Date(year - 1, 0, 1);
        const lastYearEndDate = new Date(year - 1, 11, 31, 23, 59, 59, 999);
        const lastYearNewUsers = await manager.find(User, {
          where: {
            createdAt: Between(lastYearStartDate, lastYearEndDate),
            role: {
              name: Not(UserRole.ADMIN),
            },
          },
        });
        const increaseFromLastYear =
          lastYearNewUsers.length === 0
            ? newUsers.length === 0
              ? 0
              : 100
            : parseFloat(
                (
                  ((newUsers.length - lastYearNewUsers.length) /
                    lastYearNewUsers.length) *
                  100
                ).toFixed(2),
              );

        yearlyData.push({
          data: newUsers.length,
          type: `${year}`,
          increaseFromLast: increaseFromLastYear,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: yearlyData },
      );
    });
  }

  async getLearnerPayment(
    type: AnalysisType,
    data:
      | MonthlyRequestDto
      | YearlyRequestDto
      | WeeklyRequestDto
      | PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    switch (type) {
      case AnalysisType.WEEKLY:
        return this.getWeeklyLearnerPayment(data as WeeklyRequestDto);
      case AnalysisType.MONTHLY:
        return this.getMonthlyLearnerPayment(data as MonthlyRequestDto);
      case AnalysisType.PREVIOUSLY:
        return this.getPreviouslyLearnerPayment(data as PreviouslyRequestDto);
      case AnalysisType.YEARLY:
        return this.getYearlyLearnerPayment(data as YearlyRequestDto);
      default:
        throw new BadRequestException('Không hợp lệ loại phân tích');
    }
  }

  private async getMonthlyLearnerPayment(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const isGetSingleMonthLearnerPayment =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthLearnerPayment) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);

      const payments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PAID,
          createdAt: Between(startDate, endDate),
        },
      });
      let paymentAmount = 0;
      for (const payment of payments) {
        paymentAmount += Number(payment.amount);
      }

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthPayments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PAID,
          createdAt: Between(lastMonthStartDate, lastMonthEndDate),
        },
      });
      let lastMonthPaymentAmount = 0;
      for (const payment of lastMonthPayments) {
        lastMonthPaymentAmount += Number(payment.amount);
      }

      const increaseFromLastMonth =
        lastMonthPaymentAmount === 0
          ? paymentAmount === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((paymentAmount - lastMonthPaymentAmount) /
                  lastMonthPaymentAmount) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `${data.month}/${data.year}`,
              data: payments.length,
              increaseFromLast: increaseFromLastMonth,
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
        const payments = await this.paymentRepository.find({
          where: {
            status: PaymentStatus.PAID,
            createdAt: Between(startDate, endDate),
          },
        });
        let paymentAmount = 0;
        for (const payment of payments) {
          paymentAmount += Number(payment.amount);
        }
        monthlyData.push({
          type: `${month}/${currentYear}`,
          data: paymentAmount,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  private async getWeeklyLearnerPayment(
    data: WeeklyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;

    const isGetSingleWeek = data.week !== undefined;

    if (isGetSingleWeek) {
      const weekNumber = data.week;
      const startDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7 + 1,
      );
      const endDate = new Date(
        currentYear,
        currentMonth - 1,
        weekNumber * 7,
        23,
        59,
        59,
        999,
      );

      const payments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PAID,
          createdAt: Between(startDate, endDate),
        },
      });
      let paymentAmount = 0;
      for (const payment of payments) {
        paymentAmount += Number(payment.amount);
      }

      const lastWeekStartDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 2) * 7 + 1,
      );
      const lastWeekEndDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7,
        23,
        59,
        59,
        999,
      );

      const lastWeekPayments = await this.paymentRepository.find({
        where: {
          status: PaymentStatus.PAID,
          createdAt: Between(lastWeekStartDate, lastWeekEndDate),
        },
      });
      let lastWeekPaymentAmount = 0;
      for (const payment of lastWeekPayments) {
        lastWeekPaymentAmount += Number(payment.amount);
      }

      const increaseFromLastWeek =
        lastWeekPaymentAmount === 0
          ? paymentAmount === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((paymentAmount - lastWeekPaymentAmount) /
                  lastWeekPaymentAmount) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `Week ${weekNumber} - ${currentMonth}/${currentYear}`,
              data: paymentAmount,
              increaseFromLast: increaseFromLastWeek,
            },
          ],
        },
      );
    } else {
      const weeklyData = [];
      const weeksInMonth = 5;

      for (let week = 1; week <= weeksInMonth; week++) {
        const startDate = new Date(
          currentYear,
          currentMonth - 1,
          (week - 1) * 7 + 1,
        );
        const endDate = new Date(
          currentYear,
          currentMonth - 1,
          week * 7,
          23,
          59,
          59,
          999,
        );

        const payments = await this.paymentRepository.find({
          where: {
            status: PaymentStatus.PAID,
            createdAt: Between(startDate, endDate),
          },
        });
        let paymentAmount = 0;
        for (const payment of payments) {
          paymentAmount += Number(payment.amount);
        }

        weeklyData.push({
          type: `Week ${week} - ${currentMonth}/${currentYear}`,
          data: paymentAmount,
        });
      }

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: weeklyData },
      );
    }
  }

  private async getPreviouslyLearnerPayment(
    data: PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;
    const currentDay = data.day || currentDate.getDate();

    const startDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      0,
      0,
      0,
      0,
    );
    const endDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      23,
      59,
      59,
      999,
    );

    const payments = await this.paymentRepository.find({
      where: {
        status: PaymentStatus.PAID,
        createdAt: Between(startDate, endDate),
      },
    });
    let paymentAmount = 0;
    for (const payment of payments) {
      paymentAmount += Number(payment.amount);
    }

    const previousDayStartDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      0,
      0,
      0,
      0,
    );
    const previousDayEndDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      23,
      59,
      59,
      999,
    );

    const previousDayPayments = await this.paymentRepository.find({
      where: {
        status: PaymentStatus.PAID,
        createdAt: Between(previousDayStartDate, previousDayEndDate),
      },
    });
    let previousDayPaymentAmount = 0;
    for (const payment of previousDayPayments) {
      previousDayPaymentAmount += Number(payment.amount);
    }

    const increaseFromPreviousDay =
      previousDayPaymentAmount === 0
        ? paymentAmount === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((paymentAmount - previousDayPaymentAmount) /
                previousDayPaymentAmount) *
              100
            ).toFixed(2),
          );

    return new CustomApiResponse<AnalysisResponseDto>(
      HttpStatus.OK,
      'Success',
      {
        data: [
          {
            type: `${currentDay}/${currentMonth}/${currentYear}`,
            data: paymentAmount,
            increaseFromLast: increaseFromPreviousDay,
          },
        ],
      },
    );
  }

  private async getYearlyLearnerPayment(
    data: YearlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return await this.datasource.transaction<
      CustomApiResponse<AnalysisResponseDto>
    >(async (manager) => {
      const currentYear = data.year || new Date().getFullYear();
      const yearsToFetch = 5;
      const yearlyData = [];
      for (let yearOffset = 0; yearOffset < yearsToFetch; yearOffset++) {
        const year = currentYear - yearOffset;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const payments = await manager.find(Payment, {
          where: {
            status: PaymentStatus.PAID,
            createdAt: Between(startDate, endDate),
          },
        });
        let paymentAmount = 0;
        for (const payment of payments) {
          paymentAmount += Number(payment.amount);
        }

        const lastYearStartDate = new Date(year - 1, 0, 1);
        const lastYearEndDate = new Date(year - 1, 11, 31, 23, 59, 59, 999);
        const lastYearPayments = await manager.find(Payment, {
          where: {
            status: PaymentStatus.PAID,
            createdAt: Between(lastYearStartDate, lastYearEndDate),
          },
        });
        let lastYearPaymentAmount = 0;
        for (const payment of lastYearPayments) {
          lastYearPaymentAmount += Number(payment.amount);
        }
        const increaseFromLastYear =
          lastYearPaymentAmount === 0
            ? paymentAmount === 0
              ? 0
              : 100
            : parseFloat(
                (
                  ((paymentAmount - lastYearPaymentAmount) /
                    lastYearPaymentAmount) *
                  100
                ).toFixed(2),
              );

        yearlyData.push({
          type: `${year}`,
          data: paymentAmount,
          increaseFromLast: increaseFromLastYear,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: yearlyData },
      );
    });
  }

  async getCoachSessionEarning(
    type: AnalysisType,
    data:
      | MonthlyRequestDto
      | YearlyRequestDto
      | WeeklyRequestDto
      | PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    switch (type) {
      case AnalysisType.WEEKLY:
        return this.getWeeklyCoachSessionEarning(data as WeeklyRequestDto);
      case AnalysisType.MONTHLY:
        return this.getMonthlyCoachSessionEarning(data as MonthlyRequestDto);
      case AnalysisType.PREVIOUSLY:
        return this.getPreviouslyCoachSessionEarning(
          data as PreviouslyRequestDto,
        );
      case AnalysisType.YEARLY:
        return this.getYearlyCoachSessionEarning(data as YearlyRequestDto);
      default:
        throw new BadRequestException('Không hợp lệ loại phân tích');
    }
  }

  private async getMonthlyCoachSessionEarning(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const isGetSingleMonthCoachEarning =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthCoachEarning) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);
      const sessionEarnings = await this.sessionEarningRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });
      let sessionEarningAmount = 0;
      for (const sessionEarning of sessionEarnings) {
        sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
      }

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthSessionEarnings = await this.sessionEarningRepository.find(
        {
          where: {
            createdAt: Between(lastMonthStartDate, lastMonthEndDate),
          },
        },
      );
      let lastMonthSessionEarningAmount = 0;
      for (const sessionEarning of lastMonthSessionEarnings) {
        lastMonthSessionEarningAmount += Number(
          sessionEarning.coachEarningTotal,
        );
      }

      const increaseFromLastMonth =
        lastMonthSessionEarningAmount === 0
          ? sessionEarningAmount === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((sessionEarningAmount - lastMonthSessionEarningAmount) /
                  lastMonthSessionEarningAmount) *
                100
              ).toFixed(2),
            );
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `${data.month}/${data.year}`,
              data: sessionEarnings.length,
              increaseFromLast: increaseFromLastMonth,
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
        const sessionEarnings = await this.sessionEarningRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        let sessionEarningAmount = 0;
        for (const sessionEarning of sessionEarnings) {
          sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
        }
        monthlyData.push({
          type: `${month}/${currentYear}`,
          data: sessionEarningAmount,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: monthlyData,
        },
      );
    }
  }

  private async getWeeklyCoachSessionEarning(
    data: WeeklyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;

    const isGetSingleWeek = data.week !== undefined;

    if (isGetSingleWeek) {
      const weekNumber = data.week;
      const startDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7 + 1,
      );
      const endDate = new Date(
        currentYear,
        currentMonth - 1,
        weekNumber * 7,
        23,
        59,
        59,
        999,
      );

      const sessionEarnings = await this.sessionEarningRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });
      let sessionEarningAmount = 0;
      for (const sessionEarning of sessionEarnings) {
        sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
      }

      const lastWeekStartDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 2) * 7 + 1,
      );
      const lastWeekEndDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7,
        23,
        59,
        59,
        999,
      );

      const lastWeekSessionEarnings = await this.sessionEarningRepository.find({
        where: {
          createdAt: Between(lastWeekStartDate, lastWeekEndDate),
        },
      });
      let lastWeekSessionEarningAmount = 0;
      for (const sessionEarning of lastWeekSessionEarnings) {
        lastWeekSessionEarningAmount += Number(
          sessionEarning.coachEarningTotal,
        );
      }

      const increaseFromLastWeek =
        lastWeekSessionEarningAmount === 0
          ? sessionEarningAmount === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((sessionEarningAmount - lastWeekSessionEarningAmount) /
                  lastWeekSessionEarningAmount) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `Week ${weekNumber} - ${currentMonth}/${currentYear}`,
              data: sessionEarningAmount,
              increaseFromLast: increaseFromLastWeek,
            },
          ],
        },
      );
    } else {
      const weeklyData = [];
      const weeksInMonth = 5;

      for (let week = 1; week <= weeksInMonth; week++) {
        const startDate = new Date(
          currentYear,
          currentMonth - 1,
          (week - 1) * 7 + 1,
        );
        const endDate = new Date(
          currentYear,
          currentMonth - 1,
          week * 7,
          23,
          59,
          59,
          999,
        );

        const sessionEarnings = await this.sessionEarningRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        let sessionEarningAmount = 0;
        for (const sessionEarning of sessionEarnings) {
          sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
        }

        weeklyData.push({
          type: `Week ${week} - ${currentMonth}/${currentYear}`,
          data: sessionEarningAmount,
        });
      }

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: weeklyData },
      );
    }
  }

  private async getPreviouslyCoachSessionEarning(
    data: PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;
    const currentDay = data.day || currentDate.getDate();

    const startDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      0,
      0,
      0,
      0,
    );
    const endDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      23,
      59,
      59,
      999,
    );

    const sessionEarnings = await this.sessionEarningRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });
    let sessionEarningAmount = 0;
    for (const sessionEarning of sessionEarnings) {
      sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
    }

    const previousDayStartDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      0,
      0,
      0,
      0,
    );
    const previousDayEndDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      23,
      59,
      59,
      999,
    );

    const previousDaySessionEarnings = await this.sessionEarningRepository.find(
      {
        where: {
          createdAt: Between(previousDayStartDate, previousDayEndDate),
        },
      },
    );
    let previousDaySessionEarningAmount = 0;
    for (const sessionEarning of previousDaySessionEarnings) {
      previousDaySessionEarningAmount += Number(
        sessionEarning.coachEarningTotal,
      );
    }

    const increaseFromPreviousDay =
      previousDaySessionEarningAmount === 0
        ? sessionEarningAmount === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((sessionEarningAmount - previousDaySessionEarningAmount) /
                previousDaySessionEarningAmount) *
              100
            ).toFixed(2),
          );

    return new CustomApiResponse<AnalysisResponseDto>(
      HttpStatus.OK,
      'Success',
      {
        data: [
          {
            type: `${currentDay}/${currentMonth}/${currentYear}`,
            data: sessionEarningAmount,
            increaseFromLast: increaseFromPreviousDay,
          },
        ],
      },
    );
  }

  private async getYearlyCoachSessionEarning(
    data: YearlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return await this.datasource.transaction<
      CustomApiResponse<AnalysisResponseDto>
    >(async (manager) => {
      const currentYear = data.year || new Date().getFullYear();
      const yearsToFetch = 5;
      const yearlyData = [];
      for (let yearOffset = 0; yearOffset < yearsToFetch; yearOffset++) {
        const year = currentYear - yearOffset;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const sessionEarnings = await manager.find(SessionEarning, {
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        let sessionEarningAmount = 0;
        for (const sessionEarning of sessionEarnings) {
          sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
        }

        const lastYearStartDate = new Date(year - 1, 0, 1);
        const lastYearEndDate = new Date(year - 1, 11, 31, 23, 59, 59, 999);
        const lastYearSessionEarnings = await manager.find(SessionEarning, {
          where: {
            createdAt: Between(lastYearStartDate, lastYearEndDate),
          },
        });
        let lastYearSessionEarningAmount = 0;
        for (const sessionEarning of lastYearSessionEarnings) {
          lastYearSessionEarningAmount += Number(
            sessionEarning.coachEarningTotal,
          );
        }
        const increaseFromLastYear =
          lastYearSessionEarningAmount === 0
            ? sessionEarningAmount === 0
              ? 0
              : 100
            : parseFloat(
                (
                  ((sessionEarningAmount - lastYearSessionEarningAmount) /
                    lastYearSessionEarningAmount) *
                  100
                ).toFixed(2),
              );

        yearlyData.push({
          type: `${year}`,
          data: sessionEarningAmount,
          increaseFromLast: increaseFromLastYear,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: yearlyData },
      );
    });
  }

  async getPlatformRevenue(
    type: AnalysisType,
    data:
      | MonthlyRequestDto
      | YearlyRequestDto
      | WeeklyRequestDto
      | PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    switch (type) {
      case AnalysisType.WEEKLY:
        return this.getWeeklyPlatformRevenue(data as WeeklyRequestDto);
      case AnalysisType.MONTHLY:
        return this.getMonthlyPlatformRevenue(data as MonthlyRequestDto);
      case AnalysisType.PREVIOUSLY:
        return this.getPreviouslyPlatformRevenue(data as PreviouslyRequestDto);
      case AnalysisType.YEARLY:
        return this.getYearlyPlatformRevenue(data as YearlyRequestDto);
      default:
        throw new BadRequestException('Không hợp lệ loại phân tích');
    }
  }

  private async getMonthlyPlatformRevenue(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const isGetSingleMonthPlatformRevenue =
      data.month !== undefined && data.year !== undefined;
    if (isGetSingleMonthPlatformRevenue) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);

      const courses = await this.courseRepository.find({
        where: {
          status: CourseStatus.COMPLETED,
          startDate: Between(startDate, endDate),
        },
      });
      let platformRevenue = 0;
      for (const course of courses) {
        platformRevenue +=
          Number(course.currentParticipants) *
            Number(course.pricePerParticipant) -
          Number(course.totalEarnings);
      }

      const lastMonthStartDate = new Date(data.year, data.month - 2, 1);
      const lastMonthEndDate = new Date(
        data.year,
        data.month - 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthCourses = await this.courseRepository.find({
        where: {
          status: CourseStatus.COMPLETED,
          startDate: Between(lastMonthStartDate, lastMonthEndDate),
        },
      });
      let lastMonthPlatformRevenue = 0;
      for (const course of lastMonthCourses) {
        lastMonthPlatformRevenue +=
          Number(course.currentParticipants) *
            Number(course.pricePerParticipant) -
          Number(course.totalEarnings);
      }
      const increaseFromLastMonth =
        lastMonthPlatformRevenue === 0
          ? platformRevenue === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((platformRevenue - lastMonthPlatformRevenue) /
                  lastMonthPlatformRevenue) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `${data.month}/${data.year}`,
              data: platformRevenue,
              increaseFromLast: increaseFromLastMonth,
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
        const courses = await this.courseRepository.find({
          where: {
            status: CourseStatus.COMPLETED,
            startDate: Between(startDate, endDate),
          },
        });
        let platformRevenue = 0;
        for (const course of courses) {
          platformRevenue +=
            Number(course.currentParticipants) *
              Number(course.pricePerParticipant) -
            Number(course.totalEarnings);
        }
        monthlyData.push({
          type: `${month}/${currentYear}`,
          data: platformRevenue,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  private async getWeeklyPlatformRevenue(
    data: WeeklyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;

    const isGetSingleWeek = data.week !== undefined;

    if (isGetSingleWeek) {
      const weekNumber = data.week;
      const startDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7 + 1,
      );
      const endDate = new Date(
        currentYear,
        currentMonth - 1,
        weekNumber * 7,
        23,
        59,
        59,
        999,
      );

      const courses = await this.courseRepository.find({
        where: {
          status: CourseStatus.COMPLETED,
          startDate: Between(startDate, endDate),
        },
      });
      let platformRevenue = 0;
      for (const course of courses) {
        platformRevenue +=
          Number(course.currentParticipants) *
            Number(course.pricePerParticipant) -
          Number(course.totalEarnings);
      }

      const lastWeekStartDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 2) * 7 + 1,
      );
      const lastWeekEndDate = new Date(
        currentYear,
        currentMonth - 1,
        (weekNumber - 1) * 7,
        23,
        59,
        59,
        999,
      );

      const lastWeekCourses = await this.courseRepository.find({
        where: {
          status: CourseStatus.COMPLETED,
          startDate: Between(lastWeekStartDate, lastWeekEndDate),
        },
      });
      let lastWeekPlatformRevenue = 0;
      for (const course of lastWeekCourses) {
        lastWeekPlatformRevenue +=
          Number(course.currentParticipants) *
            Number(course.pricePerParticipant) -
          Number(course.totalEarnings);
      }

      const increaseFromLastWeek =
        lastWeekPlatformRevenue === 0
          ? platformRevenue === 0
            ? 0
            : 100
          : parseFloat(
              (
                ((platformRevenue - lastWeekPlatformRevenue) /
                  lastWeekPlatformRevenue) *
                100
              ).toFixed(2),
            );

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              type: `Week ${weekNumber} - ${currentMonth}/${currentYear}`,
              data: platformRevenue,
              increaseFromLast: increaseFromLastWeek,
            },
          ],
        },
      );
    } else {
      const weeklyData = [];
      const weeksInMonth = 5;

      for (let week = 1; week <= weeksInMonth; week++) {
        const startDate = new Date(
          currentYear,
          currentMonth - 1,
          (week - 1) * 7 + 1,
        );
        const endDate = new Date(
          currentYear,
          currentMonth - 1,
          week * 7,
          23,
          59,
          59,
          999,
        );

        const courses = await this.courseRepository.find({
          where: {
            status: CourseStatus.COMPLETED,
            startDate: Between(startDate, endDate),
          },
        });
        let platformRevenue = 0;
        for (const course of courses) {
          platformRevenue +=
            Number(course.currentParticipants) *
              Number(course.pricePerParticipant) -
            Number(course.totalEarnings);
        }

        weeklyData.push({
          type: `Week ${week} - ${currentMonth}/${currentYear}`,
          data: platformRevenue,
        });
      }

      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: weeklyData },
      );
    }
  }

  private async getPreviouslyPlatformRevenue(
    data: PreviouslyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    const currentDate = new Date();
    const currentYear = data.year || currentDate.getFullYear();
    const currentMonth = data.month || currentDate.getMonth() + 1;
    const currentDay = data.day || currentDate.getDate();

    const startDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      0,
      0,
      0,
      0,
    );
    const endDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay,
      23,
      59,
      59,
      999,
    );

    const courses = await this.courseRepository.find({
      where: {
        status: CourseStatus.COMPLETED,
        startDate: Between(startDate, endDate),
      },
    });
    let platformRevenue = 0;
    for (const course of courses) {
      platformRevenue +=
        Number(course.currentParticipants) *
          Number(course.pricePerParticipant) -
        Number(course.totalEarnings);
    }

    const previousDayStartDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      0,
      0,
      0,
      0,
    );
    const previousDayEndDate = new Date(
      currentYear,
      currentMonth - 1,
      currentDay - 1,
      23,
      59,
      59,
      999,
    );

    const previousDayCourses = await this.courseRepository.find({
      where: {
        status: CourseStatus.COMPLETED,
        startDate: Between(previousDayStartDate, previousDayEndDate),
      },
    });
    let previousDayPlatformRevenue = 0;
    for (const course of previousDayCourses) {
      previousDayPlatformRevenue +=
        Number(course.currentParticipants) *
          Number(course.pricePerParticipant) -
        Number(course.totalEarnings);
    }

    const increaseFromPreviousDay =
      previousDayPlatformRevenue === 0
        ? platformRevenue === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((platformRevenue - previousDayPlatformRevenue) /
                previousDayPlatformRevenue) *
              100
            ).toFixed(2),
          );

    return new CustomApiResponse<AnalysisResponseDto>(
      HttpStatus.OK,
      'Success',
      {
        data: [
          {
            type: `${currentDay}/${currentMonth}/${currentYear}`,
            data: platformRevenue,
            increaseFromLast: increaseFromPreviousDay,
          },
        ],
      },
    );
  }

  private async getYearlyPlatformRevenue(
    data: YearlyRequestDto,
  ): Promise<CustomApiResponse<AnalysisResponseDto>> {
    return await this.datasource.transaction<
      CustomApiResponse<AnalysisResponseDto>
    >(async (manager) => {
      const currentYear = data.year || new Date().getFullYear();
      const yearsToFetch = 5;
      const yearlyData = [];
      for (let yearOffset = 0; yearOffset < yearsToFetch; yearOffset++) {
        const year = currentYear - yearOffset;
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const courses = await manager.find(Course, {
          where: {
            status: CourseStatus.COMPLETED,
            startDate: Between(startDate, endDate),
          },
        });
        let platformRevenue = 0;
        for (const course of courses) {
          platformRevenue +=
            Number(course.currentParticipants) *
              Number(course.pricePerParticipant) -
            Number(course.totalEarnings);
        }

        const lastYearStartDate = new Date(year - 1, 0, 1);
        const lastYearEndDate = new Date(year - 1, 11, 31, 23, 59, 59, 999);
        const lastYearCourses = await manager.find(Course, {
          where: {
            status: CourseStatus.COMPLETED,
            startDate: Between(lastYearStartDate, lastYearEndDate),
          },
        });
        let lastYearPlatformRevenue = 0;
        for (const course of lastYearCourses) {
          lastYearPlatformRevenue +=
            Number(course.currentParticipants) *
              Number(course.pricePerParticipant) -
            Number(course.totalEarnings);
        }
        const increaseFromLastYear =
          lastYearPlatformRevenue === 0
            ? platformRevenue === 0
              ? 0
              : 100
            : parseFloat(
                (
                  ((platformRevenue - lastYearPlatformRevenue) /
                    lastYearPlatformRevenue) *
                  100
                ).toFixed(2),
              );

        yearlyData.push({
          type: `${year}`,
          data: platformRevenue,
          increaseFromLast: increaseFromLastYear,
        });
      }
      return new CustomApiResponse<AnalysisResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: yearlyData },
      );
    });
  }

  async getDashboardOverview(): Promise<
    CustomApiResponse<DashboardOverviewDto>
  > {
    // Get current date and last month date for percentage calculations
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Users (Coach + Learner, excluding Admin)
    const totalUsers = await this.userRepository.count({
      where: {
        role: {
          name: Not(UserRole.ADMIN),
        },
      },
    });

    const lastMonthUsers = await this.userRepository.count({
      where: {
        role: {
          name: Not(UserRole.ADMIN),
        },
        createdAt: Between(lastMonth, currentMonthStart),
      },
    });

    const currentMonthUsers = await this.userRepository.count({
      where: {
        role: {
          name: Not(UserRole.ADMIN),
        },
        createdAt: Between(currentMonthStart, now),
      },
    });

    const totalUsersPercentageChange =
      lastMonthUsers === 0
        ? currentMonthUsers === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) *
              100
            ).toFixed(2),
          );

    // 2. Coaches
    const totalCoaches = await this.coachRepository.count();
    const verifiedCoaches = await this.coachRepository.count({
      where: {
        verificationStatus: CoachVerificationStatus.VERIFIED,
      },
    });
    const pendingCoaches = await this.coachRepository.count({
      where: {
        verificationStatus: CoachVerificationStatus.PENDING,
      },
    });

    const lastMonthCoaches = await this.coachRepository.count({
      where: {
        createdAt: Between(lastMonth, currentMonthStart),
      },
    });

    const currentMonthCoaches = await this.coachRepository.count({
      where: {
        createdAt: Between(currentMonthStart, now),
      },
    });

    const coachesPercentageChange =
      lastMonthCoaches === 0
        ? currentMonthCoaches === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthCoaches - lastMonthCoaches) / lastMonthCoaches) *
              100
            ).toFixed(2),
          );

    // 3. Learners
    const totalLearners = await this.learnerRepository.count();

    // Count learners by checking their associated users' createdAt
    const lastMonthLearners = await this.userRepository.count({
      where: {
        role: {
          name: UserRole.LEARNER,
        },
        createdAt: Between(lastMonth, currentMonthStart),
      },
    });

    const currentMonthLearners = await this.userRepository.count({
      where: {
        role: {
          name: UserRole.LEARNER,
        },
        createdAt: Between(currentMonthStart, now),
      },
    });

    const learnersPercentageChange =
      lastMonthLearners === 0
        ? currentMonthLearners === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthLearners - lastMonthLearners) / lastMonthLearners) *
              100
            ).toFixed(2),
          );

    // 4. Courses
    const totalCourses = await this.courseRepository.count();
    const completedCourses = await this.courseRepository.count({
      where: {
        status: CourseStatus.COMPLETED,
      },
    });
    const ongoingCourses = await this.courseRepository.count({
      where: {
        status: CourseStatus.ON_GOING,
      },
    });
    const cancelledCourses = await this.courseRepository.count({
      where: {
        status: CourseStatus.CANCELLED,
      },
    });

    // 5. Average Feedback Rating
    const allFeedbacks = await this.feedbackRepository.find({
      select: ['rating'],
    });

    let averageRating = 0;
    if (allFeedbacks.length > 0) {
      const totalRating = allFeedbacks.reduce(
        (sum, feedback) => sum + feedback.rating,
        0,
      );
      averageRating = parseFloat(
        (totalRating / allFeedbacks.length).toFixed(2),
      );
    }

    // Calculate percentage change for feedback (compare last month vs current month)
    const lastMonthFeedbacks = await this.feedbackRepository.find({
      where: {
        createdAt: Between(lastMonth, currentMonthStart),
      },
      select: ['rating'],
    });

    const currentMonthFeedbacks = await this.feedbackRepository.find({
      where: {
        createdAt: Between(currentMonthStart, now),
      },
      select: ['rating'],
    });

    let lastMonthAvgRating = 0;
    if (lastMonthFeedbacks.length > 0) {
      const lastMonthTotal = lastMonthFeedbacks.reduce(
        (sum, feedback) => sum + feedback.rating,
        0,
      );
      lastMonthAvgRating = lastMonthTotal / lastMonthFeedbacks.length;
    }

    let currentMonthAvgRating = 0;
    if (currentMonthFeedbacks.length > 0) {
      const currentMonthTotal = currentMonthFeedbacks.reduce(
        (sum, feedback) => sum + feedback.rating,
        0,
      );
      currentMonthAvgRating = currentMonthTotal / currentMonthFeedbacks.length;
    }

    const feedbackPercentageChange =
      lastMonthAvgRating === 0
        ? currentMonthAvgRating === 0
          ? 0
          : 100
        : parseFloat(
            (
              ((currentMonthAvgRating - lastMonthAvgRating) /
                lastMonthAvgRating) *
              100
            ).toFixed(2),
          );

    // 6. System Reports (Requests)
    const pendingRequests = await this.requestRepository.count({
      where: {
        status: RequestStatus.PENDING,
      },
    });
    const approvedRequests = await this.requestRepository.count({
      where: {
        status: RequestStatus.APPROVED,
      },
    });
    const rejectedRequests = await this.requestRepository.count({
      where: {
        status: RequestStatus.REJECTED,
      },
    });

    // Charts Data
    // 1. Course Status Chart
    const courseStatusChart = [
      {
        status: CourseStatus.COMPLETED,
        count: completedCourses,
      },
      {
        status: CourseStatus.ON_GOING,
        count: ongoingCourses,
      },
      {
        status: CourseStatus.CANCELLED,
        count: cancelledCourses,
      },
      {
        status: CourseStatus.APPROVED,
        count: await this.courseRepository.count({
          where: {
            status: CourseStatus.APPROVED,
          },
        }),
      },
      {
        status: CourseStatus.READY_OPENED,
        count: await this.courseRepository.count({
          where: {
            status: CourseStatus.READY_OPENED,
          },
        }),
      },
      {
        status: CourseStatus.PENDING_APPROVAL,
        count: await this.courseRepository.count({
          where: {
            status: CourseStatus.PENDING_APPROVAL,
          },
        }),
      },
    ];

    // 3. Feedback Distribution Chart (1-5 stars)
    const feedbackDistributionChart = [];
    const totalFeedbackCount = allFeedbacks.length;

    for (let rating = 1; rating <= 5; rating++) {
      const count = allFeedbacks.filter((f) => f.rating === rating).length;
      const percentage =
        totalFeedbackCount > 0
          ? parseFloat(((count / totalFeedbackCount) * 100).toFixed(2))
          : 0;
      feedbackDistributionChart.push({
        rating,
        count,
        percentage,
      });
    }

    const dashboardData: DashboardOverviewDto = {
      totalUsers: {
        total: totalUsers,
        percentageChange: totalUsersPercentageChange,
      },
      coaches: {
        total: totalCoaches,
        percentageChange: coachesPercentageChange,
        verified: verifiedCoaches,
        pending: pendingCoaches,
      },
      learners: {
        total: totalLearners,
        percentageChange: learnersPercentageChange,
      },
      courses: {
        total: totalCourses,
        completed: completedCourses,
        ongoing: ongoingCourses,
        cancelled: cancelledCourses,
      },
      averageFeedback: {
        total: averageRating,
        percentageChange: feedbackPercentageChange,
      },
      systemReports: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      courseStatusChart,
      feedbackDistributionChart,
    };

    return new CustomApiResponse<DashboardOverviewDto>(
      HttpStatus.OK,
      'Success',
      dashboardData,
    );
  }
}
