import { Payment } from '@app/database/entities/payment.entity';
import { SessionEarning } from '@app/database/entities/session-earning.entity';
import { User } from '@app/database/entities/user.entity';
import { CustomApiResponse } from '@app/shared/customs/custom-api-response';
import {
  MonthlyRequestDto,
  MonthlyResponseDto,
} from '@app/shared/dtos/coaches/coach.dto';
import { PaymentStatus } from '@app/shared/enums/payment.enum';
import { SessionEarningStatus } from '@app/shared/enums/session.enum';
import { UserRole } from '@app/shared/enums/user.enum';
import { HttpStatus, Injectable, Scope } from '@nestjs/common';
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
  ) {}

  async getMonthlyNewUsers(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
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
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: newUsers.length,
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
        const newUsers = await this.userRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
            role: {
              name: Not(UserRole.ADMIN),
            },
          },
        });
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: newUsers.length,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyLearnerPayment(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
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
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: payments.length,
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
          month: `${month}/${currentYear}`,
          data: paymentAmount,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        { data: monthlyData },
      );
    }
  }

  async getMonthlyCoachSessionEarning(
    data: MonthlyRequestDto,
  ): Promise<CustomApiResponse<MonthlyResponseDto>> {
    const isGetSingleMonthCoachEarning =
      data.month !== undefined && data.year !== undefined;

    if (isGetSingleMonthCoachEarning) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);
      const sessionEarnings = await this.sessionEarningRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
          status: SessionEarningStatus.PAID,
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
            status: SessionEarningStatus.PAID,
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
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: [
            {
              month: `${data.month}/${data.year}`,
              data: sessionEarnings.length,
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
        const sessionEarnings = await this.sessionEarningRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
            status: SessionEarningStatus.PAID,
          },
        });
        let sessionEarningAmount = 0;
        for (const sessionEarning of sessionEarnings) {
          sessionEarningAmount += Number(sessionEarning.coachEarningTotal);
        }
        monthlyData.push({
          month: `${month}/${currentYear}`,
          data: sessionEarningAmount,
        });
      }
      return new CustomApiResponse<MonthlyResponseDto>(
        HttpStatus.OK,
        'Success',
        {
          data: monthlyData,
        },
      );
    }
  }
}
